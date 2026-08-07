import { prisma } from '../config/database.js';

export const categoryRepository = {
  findMany: async (params: { page: number; limit: number; search?: string }) => {
    const { page, limit, search } = params;
    const skip = (page - 1) * limit;

    const where = search
      ? {
          OR: [{ name: { contains: search } }, { description: { contains: search } }],
          deletedAt: null,
        }
      : { deletedAt: null };

    const [items, total] = await Promise.all([
      prisma.category.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: 'asc' },
      }),
      prisma.category.count({ where }),
    ]);

    return { items, total };
  },

  findById: async (id: string) => {
    return prisma.category.findFirst({
      where: { id, deletedAt: null },
    });
  },

  findByName: async (name: string) => {
    return prisma.category.findFirst({
      where: { name, deletedAt: null },
    });
  },

  create: async (data: { name: string; description?: string }) => {
    return prisma.category.create({
      data,
    });
  },

  update: async (id: string, data: { name?: string; description?: string }) => {
    return prisma.category.update({
      where: { id },
      data,
    });
  },

  softDelete: async (id: string) => {
    return prisma.category.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  },
};
