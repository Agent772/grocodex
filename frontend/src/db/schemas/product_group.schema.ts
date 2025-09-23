$schema: "http://json-schema.org/draft-07/schema#"
import { RxJsonSchema } from 'rxdb';
import { ProductGroupDocType } from '../../types/dbCollections';

const productGroupSchema: RxJsonSchema<ProductGroupDocType> = {
  title: 'product_group',
  description: 'Group of products',
  version: 0,
  type: 'object',
  primaryKey: 'id',
  properties: {
    id: { type: 'string', maxLength: 100 },
    name: { type: 'string', maxLength: 200 },
    brand: { type: 'string', maxLength: 100 }
  },
  required: ['id', 'name'],
  indexes: ['name'],
  additionalProperties: false
};
export default productGroupSchema;
