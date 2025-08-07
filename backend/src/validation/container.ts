import { z } from 'zod';

export const containerSchema = z.object({
  name: z.string().min(1),
  parent_container_id: z.number().optional().nullable(),
  description: z.string().optional(),
  photo_url: z.string().optional(),
  ui_color: z.string().optional(),
});

export const containerUpdateSchema = containerSchema.partial();
