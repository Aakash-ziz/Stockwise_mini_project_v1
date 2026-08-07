import { Request, Response } from 'express';
import { salesService } from '../services/salesService.js';
import { catchAsync } from '../utils/catchAsync.js';

export const getSales = catchAsync(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const search = req.query.search as string | undefined;

  const result = await salesService.getSales({ page, limit, search });

  res.status(200).json({
    success: true,
    message: 'Sales retrieved successfully.',
    data: result,
  });
});

export const getSaleById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const sale = await salesService.getSaleById(id);

  res.status(200).json({
    success: true,
    message: 'Sale retrieved successfully.',
    data: sale,
  });
});

export const createSale = catchAsync(async (req: Request, res: Response) => {
  const sale = await salesService.createSale(req.body);

  res.status(201).json({
    success: true,
    message: 'Sale transaction completed successfully.',
    data: sale,
  });
});

export const updateSaleStatus = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const sale = await salesService.updateSaleStatus(id, req.body);

  res.status(200).json({
    success: true,
    message: 'Sale status updated successfully.',
    data: sale,
  });
});

export const cancelSale = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  await salesService.cancelSale(id);

  res.status(200).json({
    success: true,
    message: 'Sale transaction cancelled and inventory replenished successfully.',
    data: null,
  });
});
