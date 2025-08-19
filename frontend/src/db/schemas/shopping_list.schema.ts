import { RxJsonSchema } from 'rxdb';

import { ShoppingListDocType } from '../../../types/dbCollections';

const shoppingListSchema: RxJsonSchema<ShoppingListDocType> = {
  title: 'shopping_list',
  description: 'Shopping list',
  version: 0,
  type: 'object',
  primaryKey: 'id',
  properties: {
    id: { type: 'string' },
    name: { type: 'string' },
    created_at: { type: 'string', format: 'date-time' },
    updated_at: { type: 'string', format: 'date-time' }
  },
  required: ['id', 'name', 'created_at', 'updated_at'],
  indexes: ['name', 'id']
};

export default shoppingListSchema;
