import { z } from 'zod';

export const createSupplierSchema = z.object({
  body: z.object({
    name: z
      .string({ required_error: 'Supplier name is required' })
      .trim()
      .min(1, 'Supplier name cannot be empty')
      .max(100, 'Supplier name cannot exceed 100 characters'),
    contactInfo: z.string().trim().optional(),
  }),
});

export const updateSupplierSchema = z.object({
  body: z.object({
    name: z
      .string()
      .trim()
      .min(1, 'Supplier name cannot be empty')
      .max(100, 'Supplier name cannot exceed 100 characters')
      .optional(),
    contactInfo: z.string().trim().optional(),
  }),
  params: z.object({
    id: z.string().min(1, 'Invalid Supplier ID format'),
  }),
});

export const getSupplierByIdSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Invalid Supplier ID format'),
  }),
});

export const listSuppliersSchema = z.object({
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
