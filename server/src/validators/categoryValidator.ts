import { z } from 'zod';

export const createCategorySchema = z.object({
  body: z.object({
    name: z
      .string({ required_error: 'Category name is required' })
      .trim()
      .min(1, 'Category name cannot be empty')
      .max(50, 'Category name cannot exceed 50 characters'),
    description: z.string().trim().optional(),
  }),
});

export const updateCategorySchema = z.object({
  body: z.object({
    name: z
      .string()
      .trim()
      .min(1, 'Category name cannot be empty')
      .max(50, 'Category name cannot exceed 50 characters')
      .optional(),
    description: z.string().trim().optional(),
  }),
  params: z.object({
    id: z.string().min(1, 'Invalid Category ID format'),
  }),
});

export const getCategoryByIdSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Invalid Category ID format'),
  }),
});

export const listCategoriesSchema = z.object({
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
