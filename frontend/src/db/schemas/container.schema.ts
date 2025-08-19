import { RxJsonSchema } from 'rxdb';
import { ContainerDocType } from '../../types/dbCollections';

const containerSchema: RxJsonSchema<ContainerDocType> = {
  title: 'container',
  description: 'Container for storing grocery items',
  version: 0,
  type: 'object',
  primaryKey: 'id',
  properties: {
    id: { type: 'string', maxLength: 100 },
    name: { type: 'string', maxLength: 200 },
    parent_container_id: { type: ['string', 'null'], maxLength: 100 },
    description: { type: 'string', maxLength: 500 },
    photo_url: { type: 'string', maxLength: 500 },
    ui_color: { type: 'string', maxLength: 20 },
    created_at: { type: 'string', format: 'date-time' },
    updated_at: { type: 'string', format: 'date-time' }
  },
  required: ['id', 'name', 'created_at', 'updated_at'],
  indexes: ['name'],
  additionalProperties: false
};

export default containerSchema;
