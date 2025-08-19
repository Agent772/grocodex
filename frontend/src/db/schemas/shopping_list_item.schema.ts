import { RxJsonSchema } from 'rxdb';

import { ShoppingListItemDocType } from '../../../types/dbCollections';

const shoppingListItemSchema: RxJsonSchema<ShoppingListItemDocType> = {
  title: 'shopping_list_item',
  description: 'Item in a shopping list',
  version: 0,
  type: 'object',
  primaryKey: 'id',
  properties: {
    id: { type: 'string' },
    shopping_list_id: { type: 'string' },
    product_id: { type: 'string' },
    name: { type: 'string' },
    unit: { type: 'string' },
    quantity: { type: 'number' },
    comment: { type: 'string' },
    image_url: { type: 'string' },
    created_at: { type: 'string', format: 'date-time' },
    updated_at: { type: 'string', format: 'date-time' }
  },
  required: ['id', 'shopping_list_id', 'name', 'quantity', 'unit', 'created_at', 'updated_at'],
  indexes: ['shopping_list_id', 'product_id', 'name']
};

export default shoppingListItemSchema;
