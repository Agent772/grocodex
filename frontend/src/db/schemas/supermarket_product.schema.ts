$schema: "http://json-schema.org/draft-07/schema#"
import { RxJsonSchema } from 'rxdb';
import { SupermarketProductDocType } from '../../types/dbCollections';

const supermarketProductSchema: RxJsonSchema<SupermarketProductDocType> = {
  title: 'supermarket_product',
  description: 'Product available in a supermarket',
  version: 0,
  type: 'object',
  primaryKey: 'id',
  properties: {
    id: { type: 'string', maxLength: 100 },
    product_id: { type: 'string', maxLength: 100 },
    supermarket_id: { type: 'string', maxLength: 100 },
    in_store_location: { type: 'string', maxLength: 200 },
    created_at: { type: 'string', format: 'date-time' },
    updated_at: { type: 'string', format: 'date-time' }
  },
  required: ['id', 'product_id', 'supermarket_id', 'created_at', 'updated_at'],
  indexes: ['product_id', 'supermarket_id', 'id'],
  additionalProperties: false
};
export default supermarketProductSchema;
