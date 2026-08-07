import { Request, Response } from 'express';
import { categoryService } from '../services/categoryService.js';
import { catchAsync } from '../utils/catchAsync.js';

export const getCategories = catchAsync(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const search = req.query.search as string | undefined;

  const result = await categoryService.getCategories({ page, limit, search });

  res.status(200).json({
    success: true,
    message: 'Categories retrieved successfully.',
    data: result,
  });
});

export const getCategoryById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const category = await categoryService.getCategoryById(id);

  res.status(200).json({
    success: true,
    message: 'Category retrieved successfully.',
    data: category,
  });
});

export const createCategory = catchAsync(async (req: Request, res: Response) => {
  const category = await categoryService.createCategory(req.body);

  res.status(201).json({
    success: true,
    message: 'Category created successfully.',
    data: category,
  });
});

export const updateCategory = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const category = await categoryService.updateCategory(id, req.body);

  res.status(200).json({
    success: true,
    message: 'Category updated successfully.',
    data: category,
  });
});

export const deleteCategory = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  await categoryService.deleteCategory(id);

  res.status(200).json({
    success: true,
    message: 'Category deleted successfully.',
    data: null,
  });
});
