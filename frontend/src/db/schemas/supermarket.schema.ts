import { RxJsonSchema } from 'rxdb';

import { SupermarketDocType } from '../../../types/dbCollections';

const supermarketSchema: RxJsonSchema<SupermarketDocType> = {
  title: 'supermarket',
  description: 'Supermarket entity',
  version: 0,
  type: 'object',
  primaryKey: 'id',
  properties: {
    id: { type: 'string' },
    name: { type: 'string' },
    address: { type: 'string' },
    created_at: { type: 'string', format: 'date-time' },
    updated_at: { type: 'string', format: 'date-time' }
  },
  required: ['id', 'name', 'created_at', 'updated_at'],
  indexes: ['name', 'id']
};

export default supermarketSchema;
