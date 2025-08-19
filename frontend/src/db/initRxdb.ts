
import { createRxDatabase, addRxPlugin, RxDatabase, RxCollectionCreator } from 'rxdb';
import { getRxStorageDexie } from 'rxdb/plugins/storage-dexie';
import { addCreatedAtHook, addUpdatedAtHook } from './hooks/timestampHooks';
import { addRestQuantityDefaultHook } from './hooks/groceryItemHooks';
import { GrocodexCollections } from '../../types/dbCollections';

import containerSchema from './schemas/container.schema';
import supermarketSchema from './schemas/supermarket.schema';
import supermarketProductSchema from './schemas/supermarket_product.schema';
import productGroupSchema from './schemas/product_group.schema';
import productSchema from './schemas/product.schema';
import groceryItemSchema from './schemas/grocery_item.schema';
import shoppingListSchema from './schemas/shopping_list.schema';
import shoppingListItemSchema from './schemas/shopping_list_item.schema';

// Add RxDB plugins as needed
addRxPlugin(require('rxdb/plugins/leader-election'));
addRxPlugin(require('rxdb/plugins/update'));
addRxPlugin(require('rxdb/plugins/replication'));

export async function initRxdb(): Promise<RxDatabase<GrocodexCollections>> {
  // Create the database
  const db = await createRxDatabase<GrocodexCollections>({
    name: 'grocodex',
    storage: getRxStorageDexie(),
    multiInstance: true,
    eventReduce: true,
    ignoreDuplicate: true
  });

  // Collection definitions
  const collections: { [key: string]: RxCollectionCreator } = {
    container: { schema: containerSchema },
    supermarket: { schema: supermarketSchema },
    supermarket_product: { schema: supermarketProductSchema },
    product_group: { schema: productGroupSchema },
    product: { schema: productSchema },
    grocery_item: { schema: groceryItemSchema },
    shopping_list: { schema: shoppingListSchema },
    shopping_list_item: { schema: shoppingListItemSchema }
  };

  // Add collections and hooks
  for (const [name, config] of Object.entries(collections)) {
    if (!db.collections[name]) {
      await db.addCollections({ [name]: config });
    }
    const collection = db.collections[name];
    if (collection) {
      addCreatedAtHook(collection);
      addUpdatedAtHook(collection);
      // Add rest_quantity default hook for grocery_item collection
      if (name === 'grocery_item') {
        addRestQuantityDefaultHook(collection, db);
      }
    }
  }

  return db;
}
