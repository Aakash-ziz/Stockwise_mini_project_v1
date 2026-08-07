import { Prisma } from '@prisma/client';
import { prisma } from '../config/database.js';

export const productRepository = {
  findMany: async (params: {
    page: number;
    limit: number;
    search?: string;
    categoryId?: string;
    supplierId?: string;
    status?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) => {
    const { page, limit, search, categoryId, supplierId, status, sortBy, sortOrder } = params;
    const skip = (page - 1) * limit;

    // Filters
    const where: Prisma.ProductWhereInput = { deletedAt: null };

    if (categoryId) {
      where.categoryId = categoryId;
    }
    if (supplierId) {
      where.supplierId = supplierId;
    }
    if (status) {
      where.status = status;
    }
    if (search) {
      where.OR = [{ name: { contains: search } }, { sku: { contains: search } }];
    }

    // Sorting
    const validSortFields = ['name', 'sku', 'purchasePrice', 'sellingPrice', 'createdAt'];
    const field = sortBy && validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const orderBy: Prisma.ProductOrderByWithRelationInput = {
      [field]: sortOrder || 'desc',
    };

    const [items, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          category: true,
          supplier: true,
          inventory: true,
        },
      }),
      prisma.product.count({ where }),
    ]);

    return { items, total };
  },

  findById: async (id: string) => {
    return prisma.product.findFirst({
      where: { id, deletedAt: null },
      include: {
        category: true,
        supplier: true,
        inventory: true,
      },
    });
  },

  findBySku: async (sku: string) => {
    return prisma.product.findFirst({
      where: { sku, deletedAt: null },
    });
  },

  create: async (data: {
    name: string;
    sku: string;
    categoryId: string;
    supplierId?: string;
    purchasePrice: number;
    sellingPrice: number;
    thumbnailColor?: string;
    thumbnailIcon?: string;
    status?: string;
    quantity?: number;
    minStock?: number;
  }) => {
    const { quantity = 0, minStock = 5, ...productDetails } = data;

    // Create product and associated inventory in a transaction
    return prisma.$transaction(async (tx) => {
      const product = await tx.product.create({
        data: productDetails,
      });

      const invStatus =
        quantity > minStock ? 'IN STOCK' : quantity === 0 ? 'OUT OF STOCK' : 'LOW STOCK';

      await tx.inventory.create({
        data: {
          productId: product.id,
          quantity,
          minStock,
          status: invStatus,
        },
      });

      return tx.product.findUnique({
        where: { id: product.id },
        include: { category: true, supplier: true, inventory: true },
      });
    });
  },

  update: async (
    id: string,
    data: {
      name?: string;
      sku?: string;
      categoryId?: string;
      supplierId?: string;
      purchasePrice?: number;
      sellingPrice?: number;
      thumbnailColor?: string;
      thumbnailIcon?: string;
      status?: string;
      quantity?: number;
      minStock?: number;
    }
  ) => {
    const { quantity, minStock, ...productDetails } = data;

    return prisma.$transaction(async (tx) => {
      await tx.product.update({
        where: { id },
        data: productDetails,
      });

      if (quantity !== undefined || minStock !== undefined) {
        const currentInv = await tx.inventory.findUnique({ where: { productId: id } });
        const finalQty = quantity !== undefined ? quantity : currentInv?.quantity || 0;
        const finalMin = minStock !== undefined ? minStock : currentInv?.minStock || 5;
        const invStatus =
          finalQty > finalMin ? 'IN STOCK' : finalQty === 0 ? 'OUT OF STOCK' : 'LOW STOCK';

        await tx.inventory.update({
          where: { productId: id },
          data: {
            quantity: finalQty,
            minStock: finalMin,
            status: invStatus,
          },
        });
      }

      return tx.product.findUnique({
        where: { id },
        include: { category: true, supplier: true, inventory: true },
      });
    });
  },

  softDelete: async (id: string) => {
    return prisma.$transaction(async (tx) => {
      await tx.product.update({
        where: { id },
        data: { deletedAt: new Date() },
      });
      await tx.inventory.update({
        where: { productId: id },
        data: { deletedAt: new Date() },
      });
      return true;
    });
  },
};
