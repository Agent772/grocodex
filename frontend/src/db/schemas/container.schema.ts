
import { RxJsonSchema } from 'rxdb';
import { ContainerDocType } from '../../../types/dbCollections';

const containerSchema: RxJsonSchema<ContainerDocType> = {
  title: 'container',
  description: 'Container for storing grocery items',
  version: 0,
  type: 'object',
  primaryKey: 'id',
  properties: {
    id: { type: 'string' },
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
