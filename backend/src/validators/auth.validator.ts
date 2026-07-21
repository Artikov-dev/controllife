import { z } from 'zod';

export const registerSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters long').max(100),
  email: z.string().email('Invalid email address').max(255),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  currency: z.string().max(10).optional().default('UZS'),
  avatar: z.string().url().or(z.literal('')).optional().nullable(),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});
