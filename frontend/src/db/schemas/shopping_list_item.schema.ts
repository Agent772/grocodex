$schema: "http://json-schema.org/draft-07/schema#"
import { RxJsonSchema } from 'rxdb';
import { ShoppingListItemDocType } from '../../types/dbCollections';

const shoppingListItemSchema: RxJsonSchema<ShoppingListItemDocType> = {
  title: 'shopping_list_item',
  description: 'Item in a shopping list',
  version: 0,
  type: 'object',
  primaryKey: 'id',
  properties: {
    id: { type: 'string', maxLength: 100 },
    shopping_list_id: { type: 'string', maxLength: 100 },
    product_id: { type: 'string', maxLength: 100 },
    name: { type: 'string', maxLength: 200 },
    unit: { type: 'string', maxLength: 3 },
    quantity: { type: 'number' },
    comment: { type: 'string', maxLength: 500 },
    image_url: { type: 'string', maxLength: 500 },
    created_at: { type: 'string', format: 'date-time' },
    updated_at: { type: 'string', format: 'date-time' }
  },
  required: ['id', 'shopping_list_id', 'name', 'quantity', 'unit', 'created_at', 'updated_at'],
  indexes: ['shopping_list_id', 'name'],
  additionalProperties: false
};

export default shoppingListItemSchema;
