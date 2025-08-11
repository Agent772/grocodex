// CRUD utilities for shopping list items in IndexedDB
import { getDB } from '../index';
import { ShoppingListItem } from '../../types/entities';

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

export async function getShoppingListItems(shopping_list_id: string): Promise<ShoppingListItem[]> {
  const db = await getDB();
  return db.getAllFromIndex('shopping_list_items', 'by-shopping_list_id', shopping_list_id) as Promise<ShoppingListItem[]>;
}
