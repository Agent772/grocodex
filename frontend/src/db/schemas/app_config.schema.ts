import { RxJsonSchema } from 'rxdb';
import { AppConfigDocType } from '../../types/dbCollections';

const appConfigSchema: RxJsonSchema<AppConfigDocType> = {
  title: 'app_config',
  description: 'Application configuration settings (singleton)',
  version: 0,
  type: 'object',
  primaryKey: 'id',
  properties: {
    id: { type: 'string', maxLength: 50 }, // Always 'config' for singleton
    household_name: { type: 'string', maxLength: 200 },
    language: { type: 'string', maxLength: 10 }, // ISO language code (e.g., 'en', 'de')
    ai_token: { type: ['string', 'null'], maxLength: 500 }, // Optional AI integration token
    created_at: { type: 'string', format: 'date-time' },
    updated_at: { type: 'string', format: 'date-time' }
  },
  required: ['id', 'household_name', 'language', 'created_at', 'updated_at'],
  additionalProperties: false
};

export default appConfigSchema;
