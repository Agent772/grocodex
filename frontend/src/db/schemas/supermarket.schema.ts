$schema: "http://json-schema.org/draft-07/schema#"
import { RxJsonSchema } from 'rxdb';
import { SupermarketDocType } from '../../types/dbCollections';

const supermarketSchema: RxJsonSchema<SupermarketDocType> = {
  title: 'supermarket',
  description: 'Supermarket entity',
  version: 0,
  type: 'object',
  primaryKey: 'id',
  properties: {
    id: { type: 'string', maxLength: 100 },
    name: { type: 'string', maxLength: 100 },
    address: { type: 'string', maxLength: 200 },
    created_at: { type: 'string', format: 'date-time' },
    updated_at: { type: 'string', format: 'date-time' }
  },
  required: ['id', 'name', 'created_at', 'updated_at'],
  indexes: ['name', 'id'],
  additionalProperties: false
};

export default supermarketSchema;
