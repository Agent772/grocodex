// CRUD utilities for shopping list items in IndexedDB
import { getDB } from '../index';
import { ShoppingListItem } from '../../types/entities';

/**
 * Adds or updates a single shopping list item in IndexedDB.
 *
 * @param item - The shopping list item to add or update.
 * @returns A promise that resolves when the operation is complete.
 * @throws { error: 'ERR_SHOPPING_LIST_ITEM_CREATE_FAILED' } If the operation fails.
 */
export async function addOrUpdateShoppingListItem(item: ShoppingListItem): Promise<void> {
  const db = await getDB();
  try {
    await db.put('shopping_list_items', item);
  } catch (e) {
    throw { error: 'ERR_SHOPPING_LIST_ITEM_CREATE_FAILED' };
  }
}

/**
 * Deletes a single shopping list item by its ID.
 *
 * @param id - The ID of the shopping list item to delete.
 * @returns A promise that resolves when deletion is complete.
 * @throws { error: 'ERR_SHOPPING_LIST_ITEM_NOT_FOUND' } If the item does not exist.
 * @throws { error: 'ERR_SHOPPING_LIST_ITEM_DELETE_FAILED' } If the deletion fails.
 */
export async function deleteShoppingListItem(id: string): Promise<void> {
  const db = await getDB();
  const item = await db.get('shopping_list_items', id);
  if (!item) {
    throw { error: 'ERR_SHOPPING_LIST_ITEM_NOT_FOUND' };
  }
  try {
    await db.delete('shopping_list_items', id);
  } catch (e) {
    throw { error: 'ERR_SHOPPING_LIST_ITEM_DELETE_FAILED' };
  }
}

/**
 * Deletes multiple shopping list items by their IDs (batch delete).
 *
 * @param ids - Array of shopping list item IDs to delete.
 * @returns A promise that resolves when all deletions are complete.
 * @throws { error: 'ERR_SHOPPING_LIST_ITEM_BATCH_DELETE_FAILED' } If the batch delete operation fails.
 */
export async function deleteShoppingListItems(ids: string[]): Promise<void> {
  const db = await getDB();
  try {
    await Promise.all(ids.map(id => db.delete('shopping_list_items', id)));
  } catch (e) {
    throw { error: 'ERR_SHOPPING_LIST_ITEM_BATCH_DELETE_FAILED' };
  }
}

/**
 * Marks multiple shopping list items as complete (batch update).
 *
 * @param ids - Array of shopping list item IDs to mark as complete.
 * @returns A promise that resolves when all items are updated.
 * @throws { error: 'ERR_SHOPPING_LIST_ITEM_BATCH_COMPLETE_FAILED' } If the batch update operation fails.
 */
export async function markShoppingListItemsComplete(ids: string[]): Promise<void> {
  const db = await getDB();
  try {
    const items = await Promise.all(ids.map(id => db.get('shopping_list_items', id)));
    await Promise.all(items.map(item => {
      if (!item) return Promise.resolve();
      return db.put('shopping_list_items', { ...item, completed: true, completed_at: new Date().toISOString() });
    }));
  } catch (e) {
    throw { error: 'ERR_SHOPPING_LIST_ITEM_BATCH_COMPLETE_FAILED' };
  }
}

/**
 * Adds multiple items to a shopping list in a batch operation.
 *
 * @param shopping_list_id - The unique identifier of the shopping list to which items will be added.
 * @param items - An array of item objects to add, omitting `id`, `shopping_list_id`, and `created_at` fields (these will be generated).
 * @param created_by_user_id - (Optional) The user ID of the creator of these items.
 * @returns A promise that resolves to an array of the newly added `ShoppingListItem` objects.
 * @throws { error: 'ERR_VALIDATION', message: string } If the items array is missing or empty.
 * @throws { error: 'ERR_SHOPPING_LIST_ITEM_BATCH_ADD_FAILED' } If the batch insert operation fails.
 */
export async function batchAddShoppingListItems(
  shopping_list_id: string,
  items: Omit<ShoppingListItem, 'id' | 'shopping_list_id' | 'created_at'>[],
  created_by_user_id?: string
): Promise<ShoppingListItem[]> {
  if (!Array.isArray(items) || items.length === 0) {
    throw { error: 'ERR_VALIDATION', message: 'Items array required' };
  }
  const db = await getDB();
  const toInsert: ShoppingListItem[] = items.map(item => ({
    ...item,
    id: crypto.randomUUID(),
    shopping_list_id,
    created_by_user_id,
    created_at: new Date().toISOString(),
  }));
  try {
    await Promise.all(toInsert.map(i => db.put('shopping_list_items', i)));
    return await db.getAllFromIndex('shopping_list_items', 'by-shopping_list_id', shopping_list_id) as ShoppingListItem[];
  } catch (e) {
    throw { error: 'ERR_SHOPPING_LIST_ITEM_BATCH_ADD_FAILED' };
  }
}

/**
 * Retrieves all shopping list items associated with a specific shopping list ID.
 *
 * @param shopping_list_id - The unique identifier of the shopping list.
 * @returns A promise that resolves to an array of `ShoppingListItem` objects belonging to the specified shopping list.
 */
export async function getShoppingListItems(shopping_list_id: string): Promise<ShoppingListItem[]> {
  const db = await getDB();
  return db.getAllFromIndex('shopping_list_items', 'by-shopping_list_id', shopping_list_id) as Promise<ShoppingListItem[]>;
}
