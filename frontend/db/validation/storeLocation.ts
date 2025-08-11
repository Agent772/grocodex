// Validation schema for store locations (frontend, zod)
// Use for validating store location data before CRUD
// Returns i18n error keys on failure

import { z } from 'zod';

export const storeLocationSchema = z.object({
  product_id: z.string().min(1, { message: 'ERR_STORE_LOCATION_PRODUCT_ID_REQUIRED' }),
  supermarket_id: z.string().min(1, { message: 'ERR_STORE_LOCATION_SUPERMARKET_ID_REQUIRED' }),
  location: z.string().optional(),
});

export type StoreLocationInput = z.infer<typeof storeLocationSchema>;

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
