// Returns i18n error keys on failure
import { z } from 'zod';

/**
 * Zod schema for validating a category object.
 *
 * @property name - The name of the category. Must be a non-empty string. Returns 'ERR_CATEGORY_NAME_REQUIRED' if missing.
 * @property description - An optional description of the category.
 */
export const categorySchema = z.object({
  name: z.string().min(1, { message: 'ERR_CATEGORY_NAME_REQUIRED' }),
  description: z.string().optional(),
});

/**
 * Represents the input data structure for a category, inferred from the `categorySchema` Zod schema.
 * 
 * This type is typically used for validating and typing category-related data received from user input or API requests.
 */
export type CategoryInput = z.infer<typeof categorySchema>;

/**
 * Validates the provided data against the category schema.
 *
 * @param data - The input data to validate.
 * @returns An object indicating whether the validation was successful.
 * If valid, returns `{ valid: true, value: CategoryInput }`.
 * If invalid, returns `{ valid: false, error: string }` with an error message.
 */
export function validateCategory(data: any): { valid: true; value: CategoryInput } | { valid: false; error: string } {
  const result = categorySchema.safeParse(data);
  if (result.success) {
    return { valid: true, value: result.data };
  } else {
    const errorKey = result.error.issues[0]?.message || 'ERR_CATEGORY_VALIDATION';
    return { valid: false, error: errorKey };
  }
}
