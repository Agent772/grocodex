import { RxJsonSchema } from 'rxdb';

const shoppingListSchema: RxJsonSchema = {
  title: 'shopping_list',
  description: 'Shopping list',
  version: 0,
  type: 'object',
  properties: {
    id: { type: 'string', primary: true },
    name: { type: 'string' },
    created_at: { type: 'string', format: 'date-time' },
    updated_at: { type: 'string', format: 'date-time' }
  },
  required: ['id', 'name', 'created_at', 'updated_at'],
  indexes: ['name']
};

export default shoppingListSchema;
