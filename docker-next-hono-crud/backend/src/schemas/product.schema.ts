import { z } from 'zod';

export const createProductSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  description: z.string().optional().nullable(),
  price: z.coerce.number().nonnegative('Price must be 0 or greater'),
});

export const updateProductSchema = createProductSchema.partial();

export const idParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

