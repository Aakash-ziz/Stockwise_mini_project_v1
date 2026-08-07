import { Request, Response } from 'express';
import { reportService } from '../services/reportService.js';
import { catchAsync } from '../utils/catchAsync.js';

export const getSummary = catchAsync(async (_req: Request, res: Response) => {
  const result = await reportService.getSummary();

  res.status(200).json({
    success: true,
    message: 'Report summary calculated successfully.',
    data: result,
  });
});

export const getPerformance = catchAsync(async (req: Request, res: Response) => {
  const limit = parseInt(req.query.limit as string) || 5;
  const result = await reportService.getPerformance(limit);

  res.status(200).json({
    success: true,
    message: 'Top performing products calculated successfully.',
    data: result,
  });
});
