// IndexedDB setup for Grocodex (modular, production-ready)
// Uses idb (https://www.npmjs.com/package/idb) for a safe, promise-based API
import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { ensureDefaultAdminUser } from './entities/user';
import {
  User,
  Container,
  Supermarket,
  SupermarketProduct,
  ProductCategory,
  Product,
  GroceryItem,
  ShoppingList,
  ShoppingListItem
} from '../types/entities';

interface GrocodexDB extends DBSchema {
  users: { key: string; value: User };
  containers: {
    key: string;
    value: Container;
    indexes: { 'by-parent_container_id': string };
  };
  supermarkets: { key: string; value: Supermarket };
  supermarket_products: {
    key: string;
    value: SupermarketProduct;
    indexes: { 'by-product_id': string; 'by-supermarket_id': string };
  };
  product_categories: {
    key: string;
    value: ProductCategory;
    indexes: { 'by-name': string };
  };
  product_groups: {
    key: string;
    value: import('../types/entities').ProductGroup;
    indexes: { 'by-name': string };
  };
  products: { key: string; value: Product; indexes: { 'by-barcode': string; 'by-name': string; 'by-product_group_id': string; 'by-unit': string; 'by-quantity': string; 'by-photo_url': string } };
  grocery_items: { key: string; value: GroceryItem; indexes: { 'by-product_id': string; 'by-container_id': string; } };
  shopping_lists: { key: string; value: ShoppingList };
  shopping_list_items: { key: string; value: ShoppingListItem; indexes: { 'by-shopping_list_id': string; 'by-product_id': string } };
}

let dbPromise: Promise<IDBPDatabase<GrocodexDB>> | null = null;

export function getDB() {
  if (!dbPromise) {
    dbPromise = openDB<GrocodexDB>('grocodex', 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('users')) {
          db.createObjectStore('users', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('containers')) {
          const store = db.createObjectStore('containers', { keyPath: 'id' });
          store.createIndex('by-parent_container_id', 'parent_container_id', { unique: false });
        }
        if (!db.objectStoreNames.contains('supermarkets')) {
          db.createObjectStore('supermarkets', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('supermarket_products')) {
          const store = db.createObjectStore('supermarket_products', { keyPath: 'id' });
          store.createIndex('by-product_id', 'product_id', { unique: false });
          store.createIndex('by-supermarket_id', 'supermarket_id', { unique: false });
        }
        if (!db.objectStoreNames.contains('product_categories')) {
          const store = db.createObjectStore('product_categories', { keyPath: 'id' });
          store.createIndex('by-name', 'name', { unique: false });
        }
        if (!db.objectStoreNames.contains('product_groups')) {
          const store = db.createObjectStore('product_groups', { keyPath: 'id' });
          store.createIndex('by-name', 'name', { unique: false });
        }
        if (!db.objectStoreNames.contains('products')) {
          const store = db.createObjectStore('products', { keyPath: 'id' });
          store.createIndex('by-barcode', 'barcode', { unique: false });
          store.createIndex('by-name', 'name', { unique: false });
          store.createIndex('by-product_group_id', 'product_group_id', { unique: false });
          store.createIndex('by-unit', 'unit', { unique: false });
          store.createIndex('by-quantity', 'quantity', { unique: false });
          store.createIndex('by-photo_url', 'photo_url', { unique: false });
        }
        if (!db.objectStoreNames.contains('grocery_items')) {
          const store = db.createObjectStore('grocery_items', { keyPath: 'id' });
          store.createIndex('by-product_id', 'product_id', { unique: false });
          store.createIndex('by-container_id', 'container_id', { unique: false });
        }
        if (!db.objectStoreNames.contains('shopping_lists')) {
          db.createObjectStore('shopping_lists', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('shopping_list_items')) {
          const store = db.createObjectStore('shopping_list_items', { keyPath: 'id' });
          store.createIndex('by-shopping_list_id', 'shopping_list_id', { unique: false });
          store.createIndex('by-product_id', 'product_id', { unique: false });
        }
      },
    });
    // Ensure default admin user exists after DB setup
    dbPromise.then(() => ensureDefaultAdminUser());
  }
  return dbPromise;
}

// Utility to clear all data (for logout, testing, etc.)
export async function clearAllData() {
  const db = await getDB();
  await Promise.all(
    Array.from(db.objectStoreNames).map((store) => db.clear(store))
  );
}
