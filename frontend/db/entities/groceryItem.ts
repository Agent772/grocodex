// CRUD utilities for groceryItems in IndexedDB

import { getDB } from '../index';
import { GroceryItem } from '../../types/entities';

/**
 * Query parameters for retrieving grocery items.
 * 
 * @property {string} [product_id] - Filter by product ID.
 * @property {string} [container_id] - Filter by container ID.
 * @property {boolean} [expired] - If true, only return expired items.
 * @property {number} [expiringSoonDays] - Return items expiring within this number of days.
 * @property {number} [limit] - Maximum number of items to return.
 * @property {number} [offset] - Number of items to skip (for pagination).
 */
export interface GroceryItemQuery {
  product_id?: string;
  container_id?: string;
  expired?: boolean;
  expiringSoonDays?: number;
  name?: string;
  limit?: number;
  offset?: number;
}

/**
 * Retrieves all grocery items from IndexedDB, with optional filtering and pagination.
 * 
 * @param {GroceryItemQuery} [query] - Optional query parameters for filtering and pagination.
 * @returns {Promise<GroceryItem[]>} Promise resolving to an array of grocery items.
 */
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
  // If you want to filter by product name, do it in the UI by joining with products

  // Pagination
  if (typeof query.offset === 'number') {
    items = items.slice(query.offset);
  }
  if (typeof query.limit === 'number') {
    items = items.slice(0, query.limit);
  }

  return items;
}

/**
 * Deletes all grocery items associated with a given product ID (cascading delete).
 * 
 * @param {string} product_id - The product ID whose grocery items should be deleted.
 * @returns {Promise<void>} Promise that resolves when deletion is complete.
 */
export async function deleteGroceryItemsByProductId(product_id: string): Promise<void> {
  const db = await getDB();
  const items = await db.getAll('grocery_items') as GroceryItem[];
  const toDelete = items.filter(i => i.product_id === product_id);
  await Promise.all(toDelete.map(i => db.delete('grocery_items', i.id)));
}

/**
 * Retrieves a grocery item by its unique ID.
 * 
 * @param {string} id - The ID of the grocery item.
 * @returns {Promise<GroceryItem | undefined>} Promise resolving to the grocery item, or throws if not found.
 * @throws { error: 'ERR_GROCERY_ITEM_NOT_FOUND' } If the item does not exist.
 */
export async function getGroceryItemById(id: string): Promise<GroceryItem | undefined> {
  const db = await getDB();
  const item = await db.get('grocery_items', id) as GroceryItem | undefined;
  if (!item) {
    throw { error: 'ERR_GROCERY_ITEM_NOT_FOUND' };
  }
  return item;
}

/**
 * Adds a new grocery item or updates an existing one in IndexedDB.
 * 
 * @param {GroceryItem} item - The grocery item to add or update.
 * @returns {Promise<void>} Promise that resolves when the operation is complete.
 * @throws { error: 'ERR_GROCERY_ITEM_CREATE_FAILED' } If the operation fails.
 */
export async function addOrUpdateGroceryItem(item: GroceryItem): Promise<void> {
  const db = await getDB();
  try {
    await db.put('grocery_items', item);
  } catch (e) {
    throw { error: 'ERR_GROCERY_ITEM_CREATE_FAILED' };
  }
}

/**
 * Deletes a grocery item by its unique ID.
 * 
 * @param {string} id - The ID of the grocery item to delete.
 * @returns {Promise<void>} Promise that resolves when deletion is complete.
 * @throws { error: 'ERR_GROCERY_ITEM_NOT_FOUND' } If the item does not exist.
 * @throws { error: 'ERR_GROCERY_ITEM_DELETE_FAILED' } If the deletion fails.
 */
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