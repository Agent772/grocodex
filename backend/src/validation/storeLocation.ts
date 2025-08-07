import { z } from 'zod';

export const storeLocationSchema = z.object({
  product_id: z.number().int(),
  supermarket_id: z.number().int(),
  location: z.string().optional(),
});
