import { z } from 'zod';

export const createCategorySchema = z.object({
  name: z.string().min(1, 'Category name is required').max(100),
  icon: z.string().max(100).optional().nullable(),
  color: z.string().max(20).optional().nullable(),
  type: z.enum(['income', 'expense']),
});

export const updateCategorySchema = createCategorySchema.partial();
