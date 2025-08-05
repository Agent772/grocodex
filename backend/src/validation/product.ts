import { z } from 'zod';

export const productSchema = z.object({
  name: z.string().min(1),
  brand: z.string().optional(),
  open_food_facts_id: z.string().optional(),
  barcode: z.string().optional(),
  image_url: z.string().optional(),
  category: z.number().int().optional(),
  nutrition_info: z.any().optional(),
  supermarket_location_id: z.number().int().optional(),
});

export const productUpdateSchema = productSchema.partial();
