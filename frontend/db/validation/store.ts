// Validation schema for stores (frontend, zod)
import { z } from 'zod';

export const storeSchema = z.object({
  name: z.string().min(1, { message: 'ERR_STORE_NAME_REQUIRED' }),
  location: z.string().optional(),
});

export type StoreInput = z.infer<typeof storeSchema>;

export function validateStore(data: any): { valid: true; value: StoreInput } | { valid: false; error: string } {
  const result = storeSchema.safeParse(data);
  if (result.success) {
    return { valid: true, value: result.data };
  } else {
    const errorKey = result.error.issues[0]?.message || 'ERR_STORE_VALIDATION';
    return { valid: false, error: errorKey };
  }
}
