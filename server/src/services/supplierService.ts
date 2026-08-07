import { supplierRepository } from '../repositories/supplierRepository.js';
import { prisma } from '../config/database.js';
import { ConflictError, NotFoundError } from '../errors/customError.js';

export const supplierService = {
  getSuppliers: async (params: { page: number; limit: number; search?: string }) => {
    return supplierRepository.findMany(params);
  },

  getSupplierById: async (id: string) => {
    const supplier = await supplierRepository.findById(id);
    if (!supplier) {
      throw new NotFoundError('Supplier not found');
    }
    return supplier;
  },

  createSupplier: async (data: { name: string; contactInfo?: string }) => {
    const existing = await supplierRepository.findByName(data.name);
    if (existing) {
      throw new ConflictError(`Supplier with name "${data.name}" already exists`);
    }
    return supplierRepository.create(data);
  },

  updateSupplier: async (id: string, data: { name?: string; contactInfo?: string }) => {
    const supplier = await supplierRepository.findById(id);
    if (!supplier) {
      throw new NotFoundError('Supplier not found');
    }

    if (data.name) {
      const existing = await supplierRepository.findByName(data.name);
      if (existing && existing.id !== id) {
        throw new ConflictError(`Supplier with name "${data.name}" already exists`);
      }
    }

    return supplierRepository.update(id, data);
  },

  deleteSupplier: async (id: string) => {
    const supplier = await supplierRepository.findById(id);
    if (!supplier) {
      throw new NotFoundError('Supplier not found');
    }

    // Check if supplier has products
    const productCount = await prisma.product.count({
      where: { supplierId: id, deletedAt: null },
    });

    if (productCount > 0) {
      throw new ConflictError('Cannot delete supplier: it has products associated with it');
    }

    return supplierRepository.delete(id);
  },
};
