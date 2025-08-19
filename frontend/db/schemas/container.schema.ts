import { RxJsonSchema } from 'rxdb';

const containerSchema: RxJsonSchema = {
  title: 'container',
  description: 'Container for storing grocery items',
  version: 0,
  type: 'object',
  properties: {
    id: { type: 'string', primary: true },
    name: { type: 'string' },
    parent_container_id: { type: ['string', 'null'] },
    description: { type: 'string' },
    photo_url: { type: 'string' },
    ui_color: { type: 'string' },
    created_at: { type: 'string', format: 'date-time' },
    updated_at: { type: 'string', format: 'date-time' }
  },
  required: ['id', 'name', 'created_at', 'updated_at'],
  indexes: ['name', 'parent_container_id']
};

export default containerSchema;
