$schema: "http://json-schema.org/draft-07/schema#"
import { RxJsonSchema } from 'rxdb';
import { ProductDocType } from '../../types/dbCollections';

const productSchema: RxJsonSchema<ProductDocType> = {
  title: 'product',
  description: 'Product entity',
  version: 0,
  type: 'object',
  primaryKey: 'id',
  properties: {
    id: { type: 'string', maxLength: 100 },
    product_group_id: { type: 'string', maxLength: 100 },
    name: { type: 'string', maxLength: 200 },
    brand: { type: 'string', maxLength: 100 },
    barcode: { type: 'string', maxLength: 13 },
    unit: { type: 'string', maxLength: 3 },
    quantity: { type: 'number' },
    image_url: { type: 'string', maxLength: 500 },
    supermarket_location_id: { type: 'string', maxLength: 100 },
    created_at: { type: 'string', format: 'date-time' },
    updated_at: { type: 'string', format: 'date-time' }
  },
  required: ['id', 'product_group_id', 'name','barcode', 'unit', 'quantity', 'created_at', 'updated_at'],
  indexes: ['product_group_id', 'barcode', 'name'],
  additionalProperties: false
};

export default productSchema;
