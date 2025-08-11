// CRUD utilities for groceryItems in IndexedDB
import { getDB } from '../index';
import { GroceryItem } from '../../types/entities';

// Get all grocery items, with optional filters and pagination
export interface GroceryItemQuery {
  product_id?: string;
  container_id?: string;
  expired?: boolean;
  expiringSoonDays?: number;
  name?: string;
  limit?: number;
  offset?: number;
}

export async function getAllGroceryItems(query: GroceryItemQuery = {}): Promise<GroceryItem[]> {
  const db = await getDB();
  let items = await db.getAll('grocery_items') as GroceryItem[];

  // Filtering
  if (query.product_id) {
    items = items.filter(i => i.product_id === query.product_id);
  }
  if (query.container_id) {
    items = items.filter(i => i.container_id === query.container_id);
  }
  if (query.expired) {
    const today = new Date().toISOString().slice(0, 10);
    items = items.filter(i => i.expiration_date && i.expiration_date < today);
  }
  if (query.expiringSoonDays) {
    const today = new Date();
    const soon = new Date();
    soon.setDate(today.getDate() + query.expiringSoonDays);
    items = items.filter(i => {
      if (!i.expiration_date) return false;
      return i.expiration_date >= today.toISOString().slice(0, 10) && i.expiration_date <= soon.toISOString().slice(0, 10);
    });
  }
  if (query.name) {
    // Name search (case-insensitive)
    items = items.filter(i => i.name && i.name.toLowerCase().includes(query.name!.toLowerCase()));
  }

  // Pagination
  if (typeof query.offset === 'number') {
    items = items.slice(query.offset);
  }
  if (typeof query.limit === 'number') {
    items = items.slice(0, query.limit);
  }

  return items;
}
// Cascading delete: delete all grocery items for a given product_id
export async function deleteGroceryItemsByProductId(product_id: string): Promise<void> {
  const db = await getDB();
  const items = await db.getAll('grocery_items') as GroceryItem[];
  const toDelete = items.filter(i => i.product_id === product_id);
  await Promise.all(toDelete.map(i => db.delete('grocery_items', i.id)));
}

export async function getGroceryItemById(id: string): Promise<GroceryItem | undefined> {
  const db = await getDB();
  const item = await db.get('grocery_items', id) as GroceryItem | undefined;
  if (!item) {
    throw { error: 'ERR_GROCERY_ITEM_NOT_FOUND' };
  }
  return item;
}

export async function addOrUpdateGroceryItem(item: GroceryItem): Promise<void> {
  const db = await getDB();
  try {
    await db.put('grocery_items', item);
  } catch (e) {
    throw { error: 'ERR_GROCERY_ITEM_CREATE_FAILED' };
  }
}

export async function deleteGroceryItem(id: string): Promise<void> {
  const db = await getDB();
  const item = await db.get('grocery_items', id);
  if (!item) {
    throw { error: 'ERR_GROCERY_ITEM_NOT_FOUND' };
  }
  try {
    await db.delete('grocery_items', id);
  } catch (e) {
    throw { error: 'ERR_GROCERY_ITEM_DELETE_FAILED' };
  }
}

export async function getGroceryItemsByBarcode(barcode: string): Promise<GroceryItem[]> {
  const db = await getDB();
  return db.getAllFromIndex('grocery_items', 'by-barcode', barcode) as Promise<GroceryItem[]>;
}
