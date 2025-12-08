import { createRxDatabase, addRxPlugin, RxDatabase, RxCollectionCreator } from 'rxdb';
import { getRxStorageDexie } from 'rxdb/plugins/storage-dexie';
//import { addCreatedAtHook, addUpdatedAtHook } from './hooks/timestampHooks';
//import { addRestQuantityDefaultHook } from './hooks/groceryItemHooks';
import { addShoppingListTimestampHooks, addShoppingListItemHooks } from './hooks/logic/shoppingListDBHooks';
import { GrocodexCollections } from '../types/dbCollections';
import appConfigSchema from './schemas/app_config.schema';
import containerSchema from './schemas/container.schema';
import supermarketSchema from './schemas/supermarket.schema';
import supermarketProductSchema from './schemas/supermarket_product.schema';
import productGroupSchema from './schemas/product_group.schema';
import productSchema from './schemas/product.schema';
import groceryItemSchema from './schemas/grocery_item.schema';
import shoppingListSchema from './schemas/shopping_list.schema';
import shoppingListItemSchema from './schemas/shopping_list_item.schema';
import { RxDBLeaderElectionPlugin } from 'rxdb/plugins/leader-election';
import { RxDBUpdatePlugin } from 'rxdb/plugins/update';
import { RxDBDevModePlugin } from 'rxdb/plugins/dev-mode';
import { RxDBMigrationSchemaPlugin } from 'rxdb/plugins/migration-schema';
import { RxDBQueryBuilderPlugin } from 'rxdb/plugins/query-builder';
import { replicateCouchDB } from 'rxdb/plugins/replication-couchdb';

// Add RxDB plugins as needed
// addRxPlugin(RxDBDevModePlugin);
addRxPlugin(RxDBLeaderElectionPlugin);
addRxPlugin(RxDBUpdatePlugin);
addRxPlugin(RxDBMigrationSchemaPlugin);
addRxPlugin(RxDBQueryBuilderPlugin);
// No addRxPlugin for replication-couchdb, use replicateCouchDB directly for sync

export async function initRxdb(): Promise<RxDatabase<GrocodexCollections>> {

  // Create the database
  const db = await createRxDatabase<GrocodexCollections>({
    name: 'grocodex',
    storage: getRxStorageDexie(),
    multiInstance: true,
    eventReduce: true,
    closeDuplicates: true
  });
  

  // Collection definitions
  const collections: { [key: string]: RxCollectionCreator } = {
    app_config: { 
      schema: appConfigSchema,
      migrationStrategies: {
        1: (oldDoc: any) => {
          // Add fuzzy_match_threshold field with default value
          return {
            ...oldDoc,
            fuzzy_match_threshold: 0.7
          };
        },
        2: (oldDoc: any) => {
          // Add current_shopping_list_id field
          return {
            ...oldDoc,
            current_shopping_list_id: null
          };
        }
      }
    },
    container: { schema: containerSchema },
    supermarket: { schema: supermarketSchema },
    supermarket_product: { schema: supermarketProductSchema },
    product_group: { schema: productGroupSchema },
    product: { schema: productSchema },
    grocery_item: { schema: groceryItemSchema },
    shopping_list: { schema: shoppingListSchema },
    shopping_list_item: { 
      schema: shoppingListItemSchema,
      migrationStrategies: {
        1: (oldDoc: any) => {
          // Add completed field with default value false
          return {
            ...oldDoc,
            completed: false
          };
        },
        2: (oldDoc: any) => {
          // Add count field with default value 1
          return {
            ...oldDoc,
            count: 1
          };
        }
      }
    }
  };

  // Add collections and hooks
  for (const [name, config] of Object.entries(collections)) {
    if (!db.collections[name as keyof GrocodexCollections]) {
      await db.addCollections({ [name]: config });
    }
    const collection = db.collections[name as keyof GrocodexCollections];
    if (collection) {
      // Add shopping list hooks
      if (name === 'shopping_list') {
        addShoppingListTimestampHooks(collection as any);
      }
      if (name === 'shopping_list_item') {
        addShoppingListItemHooks(collection as any, db);
      }
    }
  }

  // Initialize default config if it doesn't exist
  const existingConfig = await db.app_config.findOne({ selector: { id: 'config' } }).exec();
  if (!existingConfig) {
    const now = new Date().toISOString();
    await db.app_config.insert({
      id: 'config',
      household_name: 'My Household',
      language: 'en', // Default to English
      ai_token: null,
      fuzzy_match_threshold: 0.7, // Default threshold for import matching
      current_shopping_list_id: null,
      created_at: now,
      updated_at: now
    });
  }

  return db;
}
