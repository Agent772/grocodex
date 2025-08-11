// Validation schema for grocery items (frontend, zod)
import { z } from 'zod';

export const groceryItemSchema = z.object({
  product_id: z.string().optional(),
  container_id: z.string().optional(),
  name: z.string().min(1, { message: 'ERR_GROCERY_ITEM_NAME_REQUIRED' }),
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

export type GroceryItemInput = z.infer<typeof groceryItemSchema>;

export function validateGroceryItem(data: any): { valid: true; value: GroceryItemInput } | { valid: false; error: string } {
  const result = groceryItemSchema.safeParse(data);
  if (result.success) {
    return { valid: true, value: result.data };
  } else {
    const errorKey = result.error.issues[0]?.message || 'ERR_GROCERY_ITEM_VALIDATION';
    return { valid: false, error: errorKey };
  }
}
