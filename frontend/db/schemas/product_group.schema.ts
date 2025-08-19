import { RxJsonSchema } from 'rxdb';

const productGroupSchema: RxJsonSchema = {
  title: 'product_group',
  description: 'Group of products',
  version: 0,
  type: 'object',
  properties: {
    id: { type: 'string', primary: true },
    name: { type: 'string' },
    brand: { type: 'string' }
  },
  required: ['id', 'name'],
  indexes: ['name']
};

export default productGroupSchema;
