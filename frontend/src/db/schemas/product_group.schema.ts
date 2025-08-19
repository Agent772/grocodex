import { RxJsonSchema } from 'rxdb';

import { ProductGroupDocType } from '../../../types/dbCollections';

const productGroupSchema: RxJsonSchema<ProductGroupDocType> = {
  title: 'product_group',
  description: 'Group of products',
  version: 0,
  type: 'object',
  primaryKey: 'id',
  properties: {
    id: { type: 'string' },
    name: { type: 'string' },
    brand: { type: 'string' }
  },
  required: ['id', 'name'],
  indexes: ['name']
};

export default productGroupSchema;
