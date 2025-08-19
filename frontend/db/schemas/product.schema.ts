import { RxJsonSchema } from 'rxdb';

const productSchema: RxJsonSchema = {
  title: 'product',
  description: 'Product entity',
  version: 0,
  type: 'object',
  properties: {
    id: { type: 'string', primary: true },
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
  indexes: ['product_group_id', 'barcode']
};

export default productSchema;
