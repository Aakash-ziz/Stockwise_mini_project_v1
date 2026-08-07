import { Prisma } from '@prisma/client';
import { prisma } from '../config/database.js';

export const salesRepository = {
  findMany: async (params: { page: number; limit: number; search?: string }) => {
    const { page, limit, search } = params;
    const skip = (page - 1) * limit;

    const where: Prisma.SaleWhereInput = { deletedAt: null };

    if (search) {
      where.OR = [{ id: { contains: search } }, { customerName: { contains: search } }];
    }

    const [items, total] = await Promise.all([
      prisma.sale.findMany({
        where,
        skip,
        take: limit,
        orderBy: { date: 'desc' },
        include: {
          saleItems: {
            include: { product: true },
          },
          user: true,
        },
      }),
      prisma.sale.count({ where }),
    ]);

    return { items, total };
  },

  findById: async (id: string) => {
    return prisma.sale.findFirst({
      where: { id, deletedAt: null },
      include: {
        saleItems: {
          include: { product: true },
        },
        user: true,
      },
    });
  },

  create: async (data: {
    id: string;
    customerName?: string;
    discount: number;
    totalPrice: number;
    status: string;
    date: Date;
    createdBy: string;
    items: {
      productId: string;
      quantity: number;
      unitPrice: number;
    }[];
  }) => {
    return prisma.$transaction(async (tx) => {
      // 1. Create Sale Header
      const sale = await tx.sale.create({
        data: {
          id: data.id,
          customerName: data.customerName,
          discount: data.discount,
          totalPrice: data.totalPrice,
          status: data.status,
          date: data.date,
          createdBy: data.createdBy,
        },
      });

      // 2. Create items and decrement inventory
      for (const item of data.items) {
        await tx.saleItem.create({
          data: {
            saleId: sale.id,
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
          },
        });

        const currentInv = await tx.inventory.findUnique({
          where: { productId: item.productId },
        });

        if (!currentInv) {
          throw new Error(`Inventory record not found for product ID ${item.productId}`);
        }

        const newQty = currentInv.quantity - item.quantity;
        if (newQty < 0) {
          throw new Error(`Insufficient stock for product ID ${item.productId}`);
        }

        const invStatus =
          newQty > currentInv.minStock ? 'IN STOCK' : newQty === 0 ? 'OUT OF STOCK' : 'LOW STOCK';

        await tx.inventory.update({
          where: { productId: item.productId },
          data: {
            quantity: newQty,
            status: invStatus,
          },
        });
      }

      return tx.sale.findUnique({
        where: { id: sale.id },
        include: {
          saleItems: {
            include: { product: true },
          },
          user: true,
        },
      });
    });
  },

  update: async (id: string, data: { status: string }) => {
    return prisma.sale.update({
      where: { id },
      data,
      include: {
        saleItems: {
          include: { product: true },
        },
        user: true,
      },
    });
  },

  softDelete: async (id: string) => {
    return prisma.sale.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  },
};
