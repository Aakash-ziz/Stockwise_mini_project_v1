import { Request, Response } from 'express';
import { supplierService } from '../services/supplierService.js';
import { catchAsync } from '../utils/catchAsync.js';

export const getSuppliers = catchAsync(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const search = req.query.search as string | undefined;

  const result = await supplierService.getSuppliers({ page, limit, search });

  res.status(200).json({
    success: true,
    message: 'Suppliers retrieved successfully.',
    data: result,
  });
});

export const getSupplierById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const supplier = await supplierService.getSupplierById(id);

  res.status(200).json({
    success: true,
    message: 'Supplier retrieved successfully.',
    data: supplier,
  });
});

export const createSupplier = catchAsync(async (req: Request, res: Response) => {
  const supplier = await supplierService.createSupplier(req.body);

  res.status(201).json({
    success: true,
    message: 'Supplier created successfully.',
    data: supplier,
  });
});

export const updateSupplier = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const supplier = await supplierService.updateSupplier(id, req.body);

  res.status(200).json({
    success: true,
    message: 'Supplier updated successfully.',
    data: supplier,
  });
});

export const deleteSupplier = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  await supplierService.deleteSupplier(id);

  res.status(200).json({
    success: true,
    message: 'Supplier deleted successfully.',
    data: null,
  });
});
