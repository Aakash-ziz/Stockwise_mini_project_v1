import { categoryRepository } from '../repositories/categoryRepository.js';
import { prisma } from '../config/database.js';
import { ConflictError, NotFoundError } from '../errors/customError.js';

export const categoryService = {
  getCategories: async (params: { page: number; limit: number; search?: string }) => {
    return categoryRepository.findMany(params);
  },

  getCategoryById: async (id: string) => {
    const category = await categoryRepository.findById(id);
    if (!category) {
      throw new NotFoundError('Category not found');
    }
    return category;
  },

  createCategory: async (data: { name: string; description?: string }) => {
    const existing = await categoryRepository.findByName(data.name);
    if (existing) {
      throw new ConflictError(`Category with name "${data.name}" already exists`);
    }
    return categoryRepository.create(data);
  },

  updateCategory: async (id: string, data: { name?: string; description?: string }) => {
    const category = await categoryRepository.findById(id);
    if (!category) {
      throw new NotFoundError('Category not found');
    }

    if (data.name) {
      const existing = await categoryRepository.findByName(data.name);
      if (existing && existing.id !== id) {
        throw new ConflictError(`Category with name "${data.name}" already exists`);
      }
    }

    return categoryRepository.update(id, data);
  },

  deleteCategory: async (id: string) => {
    const category = await categoryRepository.findById(id);
    if (!category) {
      throw new NotFoundError('Category not found');
    }

    // Check if category has assigned products
    const productCount = await prisma.product.count({
      where: { categoryId: id, deletedAt: null },
    });

    if (productCount > 0) {
      throw new ConflictError('Cannot delete category: it has active products assigned to it');
    }

    return categoryRepository.softDelete(id);
  },
};
