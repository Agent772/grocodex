import { RxJsonSchema } from 'rxdb';

const groceryItemSchema: RxJsonSchema = {
  title: 'grocery_item',
  description: 'Grocery item in a container',
  version: 0,
  type: 'object',
  properties: {
    id: { type: 'string', primary: true },
    product_id: { type: 'string' },
    container_id: { type: 'string' },
    rest_quantity: { type: 'number' },
    expiration_date: { type: 'string', format: 'date-time' },
    buy_date: { type: 'string', format: 'date-time' },
    is_opened: { type: 'boolean' },
    opened_date: { type: 'string', format: 'date-time' },
    notes: { type: 'string' },
    created_at: { type: 'string', format: 'date-time' },
    updated_at: { type: 'string', format: 'date-time' }
  },
  required: ['id', 'product_id', 'container_id', 'rest_quantity', 'created_at', 'updated_at'],
  indexes: ['product_id', 'container_id']
};

export default groceryItemSchema;
