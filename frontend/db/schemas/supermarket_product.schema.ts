import { RxJsonSchema } from 'rxdb';

const supermarketProductSchema: RxJsonSchema = {
  title: 'supermarket_product',
  description: 'Product available in a supermarket',
  version: 0,
  type: 'object',
  properties: {
    id: { type: 'string', primary: true },
    product_id: { type: 'string' },
    supermarket_id: { type: 'string' },
    in_store_location: { type: 'string' },
    created_at: { type: 'string', format: 'date-time' },
    updated_at: { type: 'string', format: 'date-time' }
  },
  required: ['id', 'product_id', 'supermarket_id', 'created_at', 'updated_at'],
  indexes: ['product_id', 'supermarket_id']
};

export default supermarketProductSchema;
