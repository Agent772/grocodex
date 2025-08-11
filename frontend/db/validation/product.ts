// Validation schema for products (frontend, zod)
import { z } from 'zod';

export const productSchema = z.object({
  name: z.string().min(1, { message: 'ERR_PRODUCT_NAME_REQUIRED' }),
  brand: z.string().optional(),
  open_food_facts_id: z.string().optional(),
  barcode: z.string().optional(),
  image_url: z.string().optional(),
  category: z.string().optional(),
  nutrition_info: z.any().optional(),
  supermarket_location_id: z.string().optional(),
});

export const productUpdateSchema = productSchema.partial();

export type ProductInput = z.infer<typeof productSchema>;

export function validateProduct(data: any): { valid: true; value: ProductInput } | { valid: false; error: string } {
  const result = productSchema.safeParse(data);
  if (result.success) {
    return { valid: true, value: result.data };
  } else {
    const errorKey = result.error.issues[0]?.message || 'ERR_PRODUCT_VALIDATION';
    return { valid: false, error: errorKey };
  }
}
