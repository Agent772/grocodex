// Validation schema for containers (frontend, zod)
import { z } from 'zod';

/**
 * Zod schema for validating a container object.
 *
 * Properties:
 * - `name` (string): The name of the container. Required. Must be at least 1 character long.
 * - `parent_container_id` (string | null | undefined): Optional. The ID of the parent container, if any.
 * - `description` (string | undefined): Optional. A description of the container.
 * - `photo_url` (string | undefined): Optional. URL to a photo representing the container.
 * - `ui_color` (string | undefined): Optional. UI color associated with the container.
 */
export const containerSchema = z.object({
  name: z.string().min(1, { message: 'ERR_CONTAINER_NAME_REQUIRED' }),
  parent_container_id: z.string().optional().nullable(),
  description: z.string().optional(),
  photo_url: z.string().optional(),
  ui_color: z.string().optional(),
});

/**
 * A schema for validating partial updates to a container object.
 * 
 * This schema allows any subset of the fields defined in `containerSchema` to be provided,
 * making it suitable for update operations where not all fields are required.
 *
 * @see containerSchema
 */
export const containerUpdateSchema = containerSchema.partial();

/**
 * Represents the input data structure for a container, as inferred from the `containerSchema` Zod schema.
 * This type is typically used for validating and typing container-related data received from user input or external sources.
 */
export type ContainerInput = z.infer<typeof containerSchema>;

/**
 * Validates the provided data against the `containerSchema`.
 *
 * @param data - The input data to validate.
 * @returns An object indicating whether the validation was successful.
 * - If valid, returns `{ valid: true, value: ContainerInput }`.
 * - If invalid, returns `{ valid: false, error: string }` with an error message.
 */
export function validateContainer(data: any): { valid: true; value: ContainerInput } | { valid: false; error: string } {
  const result = containerSchema.safeParse(data);
  if (result.success) {
    return { valid: true, value: result.data };
  } else {
    const errorKey = result.error.issues[0]?.message || 'ERR_CONTAINER_VALIDATION';
    return { valid: false, error: errorKey };
  }
}
