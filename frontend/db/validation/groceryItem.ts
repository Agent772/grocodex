// Validation schema for grocery items (frontend, zod)
import { z } from 'zod';

/**
 * Zod schema for validating a grocery item object.
 *
 * Fields:
 * - `product_id` (optional): The unique identifier for the product.
 * - `container_id` (optional): The identifier for the container holding the item.
 * - `name`: The name of the grocery item. Must be a non-empty string.
 * - `unit` (optional): The unit of measurement for the item (e.g., kg, pcs).
 * - `quantity` (optional): The quantity of the item.
 * - `rest_quantity` (optional): The remaining quantity of the item.
 * - `expiration_date` (optional): The expiration date of the item as a string.
 * - `buy_date` (optional): The purchase date of the item as a string.
 * - `is_opened` (optional): Indicates if the item has been opened.
 * - `opened_date` (optional): The date when the item was opened.
 * - `photo_url` (optional): URL to a photo of the item.
 * - `notes` (optional): Additional notes about the item.
 */
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

/**
 * A Zod schema for updating grocery items.
 * 
 * This schema is a partial version of `groceryItemSchema`, allowing any subset of the grocery item fields to be provided.
 * Useful for validating update operations where not all fields are required.
 */
export const groceryItemUpdateSchema = groceryItemSchema.partial();

/**
 * Represents the input data structure for a grocery item, as inferred from the `groceryItemSchema`.
 * 
 * This type is typically used for validating and typing data related to grocery items
 * before they are processed or stored.
 */
export type GroceryItemInput = z.infer<typeof groceryItemSchema>;

/**
 * Validates the provided data against the grocery item schema.
 *
 * @param data - The input data to validate, typically representing a grocery item.
 * @returns An object indicating whether the validation was successful:
 * - If valid, returns `{ valid: true, value: GroceryItemInput }`.
 * - If invalid, returns `{ valid: false, error: string }` with an error message.
 */
export function validateGroceryItem(data: any): { valid: true; value: GroceryItemInput } | { valid: false; error: string } {
  const result = groceryItemSchema.safeParse(data);
  if (result.success) {
    return { valid: true, value: result.data };
  } else {
    const errorKey = result.error.issues[0]?.message || 'ERR_GROCERY_ITEM_VALIDATION';
    return { valid: false, error: errorKey };
  }
}
