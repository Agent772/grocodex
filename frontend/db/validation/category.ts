// Validation schema for categories (frontend, zod)
// Returns i18n error keys on failure
import { z } from 'zod';

export const categorySchema = z.object({
  name: z.string().min(1, { message: 'ERR_CATEGORY_NAME_REQUIRED' }),
  description: z.string().optional(),
});

export type CategoryInput = z.infer<typeof categorySchema>;

export function validateCategory(data: any): { valid: true; value: CategoryInput } | { valid: false; error: string } {
  const result = categorySchema.safeParse(data);
  if (result.success) {
    return { valid: true, value: result.data };
  } else {
    const errorKey = result.error.issues[0]?.message || 'ERR_CATEGORY_VALIDATION';
    return { valid: false, error: errorKey };
  }
}
