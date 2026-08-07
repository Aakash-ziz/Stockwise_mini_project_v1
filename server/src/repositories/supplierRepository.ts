import { prisma } from '../config/database.js';

export const supplierRepository = {
  findMany: async (params: { page: number; limit: number; search?: string }) => {
    const { page, limit, search } = params;
    const skip = (page - 1) * limit;

    const where = search
      ? {
          OR: [{ name: { contains: search } }, { contactInfo: { contains: search } }],
        }
      : {};

    const [items, total] = await Promise.all([
      prisma.supplier.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: 'asc' },
      }),
      prisma.supplier.count({ where }),
    ]);

    return { items, total };
  },

  findById: async (id: string) => {
    return prisma.supplier.findUnique({
      where: { id },
    });
  },

  findByName: async (name: string) => {
    return prisma.supplier.findUnique({
      where: { name },
    });
  },

  create: async (data: { name: string; contactInfo?: string }) => {
    return prisma.supplier.create({
      data,
    });
  },

  update: async (id: string, data: { name?: string; contactInfo?: string }) => {
    return prisma.supplier.update({
      where: { id },
      data,
    });
  },

  delete: async (id: string) => {
    return prisma.supplier.delete({
      where: { id },
    });
  },
};
