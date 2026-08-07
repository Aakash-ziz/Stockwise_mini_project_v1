import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { CustomError } from '../errors/customError.js';
import { logger } from '../utils/logger.js';

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
) => {
  // 1. Handle Custom Operational Errors
  if (err instanceof CustomError) {
    logger.warn(`Operational Error: [${err.statusCode}] - ${err.message}`);
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errors: err.serializeErrors(),
    });
  }

  // 2. Handle Prisma Client Known Database Errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    logger.warn(`Prisma Error: [${err.code}] - ${err.message}`);

    // Unique constraint violation (e.g. duplicate SKU)
    if (err.code === 'P2002') {
      const targets = (err.meta?.target as string[]) || [];
      const fieldName = targets.join(', ');
      return res.status(409).json({
        success: false,
        message: `Duplicate resource record. Unique constraint failed on field(s): ${fieldName}`,
        errors: [{ field: fieldName, message: 'This value is already in use' }],
      });
    }

    // Foreign key violation
    if (err.code === 'P2003') {
      const fieldName = (err.meta?.field_name as string) || 'foreign_key';
      return res.status(400).json({
        success: false,
        message: `Database connection validation failed. Foreign key constraint violated on field: ${fieldName}`,
        errors: [
          { field: fieldName, message: 'The referenced foreign key resource does not exist' },
        ],
      });
    }

    // Record not found
    if (err.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: 'The requested database record was not found or is currently unavailable',
        errors: [],
      });
    }
  }

  // 3. Fallback for Unexpected programmer/system errors
  logger.error(`Programmer Error: ${err.message}\nStack: ${err.stack}`);

  return res.status(500).json({
    success: false,
    message: 'An unexpected error occurred. Please try again later.',
    errors: [],
  });
};
