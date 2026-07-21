import { z } from 'zod';

export const createTransactionSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255),
  amount: z.coerce.number().positive('Amount must be greater than 0'),
  description: z.string().optional().nullable(),
  transaction_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Transaction date must be in YYYY-MM-DD format'),
  type: z.enum(['income', 'expense']),
  category_id: z.coerce.number().int().positive('Valid category ID is required'),
});

export const updateTransactionSchema = createTransactionSchema.partial();
