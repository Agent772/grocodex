import { RxJsonSchema } from 'rxdb';

import { ProductDocType } from '../../../types/dbCollections';

const productSchema: RxJsonSchema<ProductDocType> = {
  title: 'product',
  description: 'Product entity',
  version: 0,
  type: 'object',
  primaryKey: 'id',
  properties: {
    id: { type: 'string' },
    product_group_id: { type: 'string' },
    name: { type: 'string' },
    brand: { type: 'string' },
    barcode: { type: 'string' },
    unit: { type: 'string' },
    quantity: { type: 'number' },
    image_url: { type: 'string' },
    supermarket_location_id: { type: 'string' },
    created_at: { type: 'string', format: 'date-time' },
    updated_at: { type: 'string', format: 'date-time' }
  },
  required: ['id', 'product_group_id', 'name', 'unit', 'quantity', 'created_at', 'updated_at'],
  indexes: ['product_group_id', 'barcode', 'name', 'supermarket_location_id']
};

export default productSchema;
