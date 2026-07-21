import { z } from 'zod';

export const createRecurringSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255),
  amount: z.coerce.number().positive('Amount must be greater than 0'),
  frequency: z.enum(['daily', 'weekly', 'monthly', 'yearly']),
  category_id: z.coerce.number().int().positive('Valid category ID is required'),
  next_run: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Next run date must be in YYYY-MM-DD format'),
});
