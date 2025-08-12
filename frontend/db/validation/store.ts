// Validation schema for stores (frontend, zod)
import { z } from 'zod';

/**
 * Zod schema for validating a store object.
 *
 * - `name`: Required string. Must be at least 1 character long. Returns error message `'ERR_STORE_NAME_REQUIRED'` if missing or empty.
 * - `location`: Optional string representing the store's location.
 */
export const storeSchema = z.object({
  name: z.string().min(1, { message: 'ERR_STORE_NAME_REQUIRED' }),
  location: z.string().optional(),
});

/**
 * Represents the input data structure for a store, inferred from the `storeSchema` Zod schema.
 * This type is typically used for validating and typing data related to store creation or updates.
 */
export type StoreInput = z.infer<typeof storeSchema>;

/**
 * Validates the provided store data against the `storeSchema`.
 *
 * @param data - The input data to validate as a store.
 * @returns An object indicating whether the validation was successful:
 * - If valid, returns `{ valid: true, value: StoreInput }`.
 * - If invalid, returns `{ valid: false, error: string }` with an error message.
 */
export function validateStore(data: any): { valid: true; value: StoreInput } | { valid: false; error: string } {
  const result = storeSchema.safeParse(data);
  if (result.success) {
    return { valid: true, value: result.data };
  } else {
    const errorKey = result.error.issues[0]?.message || 'ERR_STORE_VALIDATION';
    return { valid: false, error: errorKey };
  }
}
