// Validation schema for containers (frontend, zod)
import { z } from 'zod';

export const containerSchema = z.object({
  name: z.string().min(1, { message: 'ERR_CONTAINER_NAME_REQUIRED' }),
  parent_container_id: z.string().optional().nullable(),
  description: z.string().optional(),
  photo_url: z.string().optional(),
  ui_color: z.string().optional(),
});

export const containerUpdateSchema = containerSchema.partial();

export type ContainerInput = z.infer<typeof containerSchema>;

export function validateContainer(data: any): { valid: true; value: ContainerInput } | { valid: false; error: string } {
  const result = containerSchema.safeParse(data);
  if (result.success) {
    return { valid: true, value: result.data };
  } else {
    const errorKey = result.error.issues[0]?.message || 'ERR_CONTAINER_VALIDATION';
    return { valid: false, error: errorKey };
  }
}
