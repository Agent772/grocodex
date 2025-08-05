import { z } from 'zod';

export const groceryItemSchema = z.object({
  product_id: z.number().int().optional(),
  container_id: z.number().int().optional(),
  name: z.string().min(1),
  unit: z.string().optional(),
  quantity: z.number().optional(),
  rest_quantity: z.number().optional(),
  expiration_date: z.string().optional(),
  buy_date: z.string().optional(),
  is_opened: z.boolean().optional(),
  opened_date: z.string().optional(),
  photo_url: z.string().optional(),
  notes: z.string().optional(),
});

export const groceryItemUpdateSchema = groceryItemSchema.partial();
