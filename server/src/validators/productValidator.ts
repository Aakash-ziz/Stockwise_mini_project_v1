import { z } from 'zod';

export const createProductSchema = z.object({
  body: z.object({
    name: z
      .string({ required_error: 'Product name is required' })
      .trim()
      .min(1, 'Product name cannot be empty'),
    sku: z
      .string({ required_error: 'SKU is required' })
      .trim()
      .min(1, 'SKU cannot be empty')
      .regex(
        /^[a-zA-Z0-9_-]+$/,
        'SKU must be alphanumeric and may only contain letters, numbers, hyphens, or underscores'
      ),
    categoryId: z
      .string({ required_error: 'Category ID is required' })
      .min(1, 'Category ID is required'),
    supplierId: z.string().min(1, 'Invalid Supplier ID format').optional(),
    purchasePrice: z
      .number({ required_error: 'Purchase price is required' })
      .nonnegative('Purchase price cannot be negative'),
    sellingPrice: z
      .number({ required_error: 'Selling price is required' })
      .nonnegative('Selling price cannot be negative'),
    thumbnailColor: z.string().trim().optional(),
    thumbnailIcon: z.string().trim().optional(),
    status: z.enum(['ACTIVE', 'INACTIVE', 'RETIRED']).optional(),
    quantity: z.number().int().nonnegative('Initial quantity cannot be negative').optional(),
    minStock: z.number().int().nonnegative('Safety minimum stock cannot be negative').optional(),
  }),
});

export const updateProductSchema = z.object({
  body: z.object({
    name: z.string().trim().min(1, 'Product name cannot be empty').optional(),
    sku: z
      .string()
      .trim()
      .min(1, 'SKU cannot be empty')
      .regex(
        /^[a-zA-Z0-9_-]+$/,
        'SKU must be alphanumeric and may only contain letters, numbers, hyphens, or underscores'
      )
      .optional(),
    categoryId: z.string().min(1, 'Invalid Category ID format').optional(),
    supplierId: z.string().min(1, 'Invalid Supplier ID format').optional(),
    purchasePrice: z.number().nonnegative('Purchase price cannot be negative').optional(),
    sellingPrice: z.number().nonnegative('Selling price cannot be negative').optional(),
    thumbnailColor: z.string().trim().optional(),
    thumbnailIcon: z.string().trim().optional(),
    status: z.enum(['ACTIVE', 'INACTIVE', 'RETIRED']).optional(),
    quantity: z.number().int().nonnegative('Quantity cannot be negative').optional(),
    minStock: z.number().int().nonnegative('Safety minimum stock cannot be negative').optional(),
  }),
  params: z.object({
    id: z.string().min(1, 'Invalid Product ID format'),
  }),
});

export const getProductByIdSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Invalid Product ID format'),
  }),
});

export const listProductsSchema = z.object({
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
    categoryId: z.string().min(1, 'Invalid Category ID format').optional(),
    supplierId: z.string().min(1, 'Invalid Supplier ID format').optional(),
    status: z.string().trim().optional(),
    sortBy: z.string().trim().optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
  }),
});
