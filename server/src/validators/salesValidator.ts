import { z } from 'zod';

export const createSaleSchema = z.object({
  body: z.object({
    customerName: z.string().trim().optional(),
    discount: z
      .number()
      .min(0, 'Discount cannot be negative')
      .max(100, 'Discount cannot exceed 100%')
      .default(0),
    createdBy: z
      .string({ required_error: 'Created by user ID is required' })
      .trim()
      .min(1, 'User ID cannot be empty'),
    items: z
      .array(
        z.object({
          productId: z
            .string({ required_error: 'Product ID is required' })
            .min(1, 'Product ID is required'),
          quantity: z.number().int().min(1, 'Quantity must be at least 1'),
          unitPrice: z.number().nonnegative('Unit price cannot be negative'),
        })
      )
      .min(1, 'A checkout transaction must contain at least one line item'),
  }),
});

export const updateSaleStatusSchema = z.object({
  body: z.object({
    status: z.enum(['DELIVERED', 'PROCESSING', 'ON HOLD']),
  }),
  params: z.object({
    id: z
      .string()
      .regex(/^TXN-[0-9]{5}$/, 'Invalid invoice transaction code format (Expected: TXN-[0-9]{5})'),
  }),
});

export const getSaleByIdSchema = z.object({
  params: z.object({
    id: z.string().regex(/^TXN-[0-9]{5}$/, 'Invalid invoice transaction code format'),
  }),
});

export const listSalesSchema = z.object({
  query: z.object({
    page: z
      .string()
      .optional()
      .transform((val) => (val ? parseInt(val, 10) : 1)),
    limit: z
      .string()
      .optional()
      .transform((val) => (val ? parseInt(val, 10) : 20)),
    search: z.string().trim().optional(),
  }),
});
