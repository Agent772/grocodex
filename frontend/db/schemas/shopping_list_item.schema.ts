import { RxJsonSchema } from 'rxdb';

const shoppingListItemSchema: RxJsonSchema = {
  title: 'shopping_list_item',
  description: 'Item in a shopping list',
  version: 0,
  type: 'object',
  properties: {
    id: { type: 'string', primary: true },
    shopping_list_id: { type: 'string' },
    product_id: { type: 'string' },
    quantity: { type: 'number' },
    comment: { type: 'string' },
    image_url: { type: 'string' },
    created_at: { type: 'string', format: 'date-time' },
    updated_at: { type: 'string', format: 'date-time' }
  },
  required: ['id', 'shopping_list_id', 'product_id', 'quantity', 'created_at', 'updated_at'],
  indexes: ['shopping_list_id', 'product_id']
};

export default shoppingListItemSchema;
