import { Request, Response } from 'express';
import { productService } from '../services/productService.js';
import { catchAsync } from '../utils/catchAsync.js';

export const getProducts = catchAsync(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const search = req.query.search as string | undefined;
  const categoryId = req.query.categoryId as string | undefined;
  const supplierId = req.query.supplierId as string | undefined;
  const status = req.query.status as string | undefined;
  const sortBy = req.query.sortBy as string | undefined;
  const sortOrder = (req.query.sortOrder as 'asc' | 'desc') || 'desc';

  const result = await productService.getProducts({
    page,
    limit,
    search,
    categoryId,
    supplierId,
    status,
    sortBy,
    sortOrder,
  });

  res.status(200).json({
    success: true,
    message: 'Products retrieved successfully.',
    data: result,
  });
});

export const getProductById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const product = await productService.getProductById(id);

  res.status(200).json({
    success: true,
    message: 'Product retrieved successfully.',
    data: product,
  });
});

export const createProduct = catchAsync(async (req: Request, res: Response) => {
  const product = await productService.createProduct(req.body);

  res.status(201).json({
    success: true,
    message: 'Product created successfully.',
    data: product,
  });
});

export const updateProduct = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const product = await productService.updateProduct(id, req.body);

  res.status(200).json({
    success: true,
    message: 'Product updated successfully.',
    data: product,
  });
});

export const deleteProduct = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  await productService.deleteProduct(id);

  res.status(200).json({
    success: true,
    message: 'Product deleted successfully.',
    data: null,
  });
});
