// Validation schema for store locations (frontend, zod)
// Use for validating store location data before CRUD
// Returns i18n error keys on failure

import { z } from 'zod';

/**
 * Zod schema for validating store location objects.
 *
 * This schema enforces the following rules:
 * - `product_id`: Required string, must not be empty. Returns error message 'ERR_STORE_LOCATION_PRODUCT_ID_REQUIRED' if missing or empty.
 * - `supermarket_id`: Required string, must not be empty. Returns error message 'ERR_STORE_LOCATION_SUPERMARKET_ID_REQUIRED' if missing or empty.
 * - `location`: Optional string.
 */
export const storeLocationSchema = z.object({
  product_id: z.string().min(1, { message: 'ERR_STORE_LOCATION_PRODUCT_ID_REQUIRED' }),
  supermarket_id: z.string().min(1, { message: 'ERR_STORE_LOCATION_SUPERMARKET_ID_REQUIRED' }),
  location: z.string().optional(),
});

/**
 * Represents the input data structure for a store location, as inferred from the `storeLocationSchema`.
 * 
 * This type is typically used for validating and typing data related to store locations,
 * ensuring it conforms to the schema defined by `storeLocationSchema`.
 */
export type StoreLocationInput = z.infer<typeof storeLocationSchema>;

/**
 * Validates the provided data against the store location schema.
 *
 * @param data - The input data to validate.
 * @returns An object indicating whether the validation was successful.
 * If valid, returns `{ valid: true, value: StoreLocationInput }`.
 * If invalid, returns `{ valid: false, error: string }` with an error message key.
 */
export function validateStoreLocation(data: any): { valid: true; value: StoreLocationInput } | { valid: false; error: string } {
  const result = storeLocationSchema.safeParse(data);
  if (result.success) {
    return { valid: true, value: result.data };
  } else {
    // Return first error key for i18n
    const errorKey = result.error.issues[0]?.message || 'ERR_STORE_LOCATION_VALIDATION';
    return { valid: false, error: errorKey };
  }
}
