$schema: "http://json-schema.org/draft-07/schema#"
import { RxJsonSchema } from 'rxdb';
import { GroceryItemDocType } from '../../types/dbCollections';

const groceryItemSchema: RxJsonSchema<GroceryItemDocType> = {
  title: 'grocery_item',
  description: 'Grocery item (instance of product) in a container',
  version: 0,
  type: 'object',
  primaryKey: 'id',
  properties: {
    id: { type: 'string', maxLength: 100 },
    product_id: { type: 'string', maxLength: 100 },
    container_id: { type: 'string', maxLength: 100 },
    rest_quantity: { type: 'number' },
    expiration_date: { type: 'string', format: 'date-time' },
    buy_date: { type: 'string', format: 'date-time' },
    is_opened: { type: 'boolean' },
    opened_date: { type: 'string', format: 'date-time' },
    notes: { type: 'string', maxLength: 500 },
    created_at: { type: 'string', format: 'date-time' },
    updated_at: { type: 'string', format: 'date-time' }
  },
  required: ['id', 'product_id', 'container_id', 'rest_quantity', 'created_at', 'updated_at'],
  indexes: ['product_id', 'container_id'],
  additionalProperties: false
};

export default groceryItemSchema;
