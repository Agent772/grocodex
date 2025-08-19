import { RxJsonSchema } from 'rxdb';

const supermarketSchema: RxJsonSchema = {
  title: 'supermarket',
  description: 'Supermarket entity',
  version: 0,
  type: 'object',
  properties: {
    id: { type: 'string', primary: true },
    name: { type: 'string' },
    adress: { type: 'string' },
    created_at: { type: 'string', format: 'date-time' },
    updated_at: { type: 'string', format: 'date-time' }
  },
  required: ['id', 'name', 'created_at', 'updated_at'],
  indexes: ['name']
};

export default supermarketSchema;
