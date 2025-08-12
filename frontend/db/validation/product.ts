// Validation schema for products (frontend, zod)
import { z } from 'zod';

/**
 * Zod schema for validating product objects.
 *
 * Fields:
 * - `name` (string, required): The name of the product. Must not be empty. Error message: 'ERR_PRODUCT_NAME_REQUIRED'.
 * - `brand` (string, optional): The brand of the product.
 * - `open_food_facts_id` (string, optional): The Open Food Facts identifier for the product.
 * - `barcode` (string, optional): The barcode associated with the product.
 * - `image_url` (string, optional): URL to an image of the product.
 * - `category` (string, optional): The category to which the product belongs.
 * - `nutrition_info` (any, optional): Nutritional information for the product.
 * - `supermarket_location_id` (string, optional): Identifier for the supermarket location where the product is found.
 */
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

/**
 * A Zod schema for validating partial updates to a product.
 * 
 * This schema allows any subset of the fields defined in `productSchema` to be provided,
 * making all properties optional. It is typically used for update operations where not all
 * product fields need to be specified.
 *
 * @see productSchema
 */
export const productUpdateSchema = productSchema.partial();

/**
 * Represents the input data structure for a product, inferred from the `productSchema` Zod schema.
 * This type is typically used for validating and typing product-related data received from user input or API requests.
 */
export type ProductInput = z.infer<typeof productSchema>;

/**
 * Validates the provided product data against the `productSchema`.
 *
 * @param data - The input data to validate as a product.
 * @returns An object indicating whether the validation was successful:
 * - If valid, returns `{ valid: true, value: ProductInput }`.
 * - If invalid, returns `{ valid: false, error: string }` with an error message.
 */
export function validateProduct(data: any): { valid: true; value: ProductInput } | { valid: false; error: string } {
  const result = productSchema.safeParse(data);
  if (result.success) {
    return { valid: true, value: result.data };
  } else {
    const errorKey = result.error.issues[0]?.message || 'ERR_PRODUCT_VALIDATION';
    return { valid: false, error: errorKey };
  }
}
