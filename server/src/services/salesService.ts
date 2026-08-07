import { salesRepository } from '../repositories/salesRepository.js';
import { prisma } from '../config/database.js';
import { BadRequestError, ConflictError, NotFoundError } from '../errors/customError.js';

export const salesService = {
  getSales: async (params: { page: number; limit: number; search?: string }) => {
    return salesRepository.findMany(params);
  },

  getSaleById: async (id: string) => {
    const sale = await salesRepository.findById(id);
    if (!sale) {
      throw new NotFoundError('Sale transaction invoice not found');
    }
    return sale;
  },

  createSale: async (data: {
    customerName?: string;
    discount: number;
    createdBy: string;
    items: {
      productId: string;
      quantity: number;
      unitPrice: number;
    }[];
  }) => {
    // 1. Verify User (createdBy) exists
    const user = await prisma.user.findUnique({
      where: { id: data.createdBy },
    });
    if (!user) {
      throw new NotFoundError(`User ID ${data.createdBy} not found`);
    }

    // 2. Validate products and stock levels
    for (const item of data.items) {
      const product = await prisma.product.findFirst({
        where: { id: item.productId, deletedAt: null },
        include: { inventory: true },
      });

      if (!product) {
        throw new NotFoundError(`Product ID ${item.productId} not found`);
      }

      if (!product.inventory) {
        throw new BadRequestError(`No inventory registry configured for product: ${product.name}`);
      }

      if (product.inventory.quantity < item.quantity) {
        throw new BadRequestError(
          `Insufficient stock levels for product "${product.name}". Available: ${product.inventory.quantity}, Requested: ${item.quantity}`
        );
      }
    }

    // 3. Generate a unique TXN-XXXXX code
    let isUnique = false;
    let saleId = '';
    while (!isUnique) {
      const code = Math.floor(10000 + Math.random() * 90000);
      saleId = `TXN-${code}`;
      const existing = await prisma.sale.findUnique({ where: { id: saleId } });
      if (!existing) {
        isUnique = true;
      }
    }

    // 4. Calculate total price
    const subtotal = data.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
    const totalPrice = parseFloat((subtotal * (1 - data.discount / 100)).toFixed(2));

    return salesRepository.create({
      id: saleId,
      customerName: data.customerName,
      discount: data.discount,
      totalPrice,
      status: 'DELIVERED', // default status
      date: new Date(),
      createdBy: data.createdBy,
      items: data.items,
    });
  },

  updateSaleStatus: async (id: string, data: { status: string }) => {
    const sale = await salesRepository.findById(id);
    if (!sale) {
      throw new NotFoundError('Sale transaction invoice not found');
    }
    return salesRepository.update(id, data);
  },

  cancelSale: async (id: string) => {
    const sale = await salesRepository.findById(id);
    if (!sale) {
      throw new NotFoundError('Sale transaction invoice not found');
    }

    // Business rule: Completed (Delivered) sales cannot be deleted or canceled
    if (sale.status === 'DELIVERED') {
      throw new ConflictError(
        'Completed transactions (DELIVERED) are immutable and cannot be canceled'
      );
    }

    // Replenish inventory in transaction
    await prisma.$transaction(async (tx) => {
      for (const item of sale.saleItems) {
        const currentInv = await tx.inventory.findUnique({
          where: { productId: item.productId },
        });

        if (currentInv) {
          const newQty = currentInv.quantity + item.quantity;
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
      }

      await tx.sale.update({
        where: { id },
        data: { deletedAt: new Date() },
      });
    });

    return true;
  },
};
