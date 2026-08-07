import { productRepository } from '../repositories/productRepository.js';
import { prisma } from '../config/database.js';
import { ConflictError, NotFoundError } from '../errors/customError.js';

export const productService = {
  getProducts: async (params: {
    page: number;
    limit: number;
    search?: string;
    categoryId?: string;
    supplierId?: string;
    status?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) => {
    return productRepository.findMany(params);
  },

  getProductById: async (id: string) => {
    const product = await productRepository.findById(id);
    if (!product) {
      throw new NotFoundError('Product not found');
    }
    return product;
  },

  createProduct: async (data: {
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
    // 1. Verify Category exists
    const category = await prisma.category.findFirst({
      where: { id: data.categoryId, deletedAt: null },
    });
    if (!category) {
      throw new NotFoundError(`Category ID ${data.categoryId} not found`);
    }

    // 2. Verify Supplier exists (if provided)
    if (data.supplierId) {
      const supplier = await prisma.supplier.findUnique({
        where: { id: data.supplierId },
      });
      if (!supplier) {
        throw new NotFoundError(`Supplier ID ${data.supplierId} not found`);
      }
    }

    // 3. Verify SKU is unique
    const existingSku = await productRepository.findBySku(data.sku);
    if (existingSku) {
      throw new ConflictError(`Product SKU "${data.sku}" is already assigned to a product`);
    }

    return productRepository.create(data);
  },

  updateProduct: async (
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
    const product = await productRepository.findById(id);
    if (!product) {
      throw new NotFoundError('Product not found');
    }

    if (data.categoryId) {
      const category = await prisma.category.findFirst({
        where: { id: data.categoryId, deletedAt: null },
      });
      if (!category) {
        throw new NotFoundError(`Category ID ${data.categoryId} not found`);
      }
    }

    if (data.supplierId) {
      const supplier = await prisma.supplier.findUnique({
        where: { id: data.supplierId },
      });
      if (!supplier) {
        throw new NotFoundError(`Supplier ID ${data.supplierId} not found`);
      }
    }

    if (data.sku) {
      const existingSku = await productRepository.findBySku(data.sku);
      if (existingSku && existingSku.id !== id) {
        throw new ConflictError(`Product SKU "${data.sku}" is already assigned to another product`);
      }
    }

    return productRepository.update(id, data);
  },

  deleteProduct: async (id: string) => {
    const product = await productRepository.findById(id);
    if (!product) {
      throw new NotFoundError('Product not found');
    }

    // Check if product has sales transactions
    const salesCount = await prisma.saleItem.count({
      where: { productId: id, deletedAt: null },
    });

    if (salesCount > 0) {
      // Retiring product instead of deletion if transactions exist
      await prisma.product.update({
        where: { id },
        data: { status: 'RETIRED' },
      });
      throw new ConflictError(
        'Cannot delete product due to existing historical sales transactions. Product has been status marked as "RETIRED".'
      );
    }

    return productRepository.softDelete(id);
  },
};
