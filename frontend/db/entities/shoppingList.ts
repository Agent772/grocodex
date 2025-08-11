// CRUD utilities for shopping lists in IndexedDB
import { getDB } from '../index';
import { ShoppingList } from '../../types/entities';

export async function createShoppingList(name: string, created_by_user_id?: string): Promise<ShoppingList> {
  if (!name) throw { error: 'ERR_VALIDATION', message: 'Name is required' };
  const list: ShoppingList = {
    id: crypto.randomUUID(),
    name,
    created_at: new Date().toISOString(),
    created_by_user_id,
  };
  const db = await getDB();
  try {
    await db.put('shopping_lists', list);
    return list;
  } catch (e) {
    throw { error: 'ERR_SHOPPING_LIST_CREATE_FAILED' };
  }
}

export async function getAllShoppingLists(created_by_user_id?: string): Promise<ShoppingList[]> {
  const db = await getDB();
  let lists = await db.getAll('shopping_lists') as ShoppingList[];
  if (created_by_user_id) {
    lists = lists.filter(l => l.created_by_user_id === created_by_user_id);
  }
  return lists;
}

export async function getShoppingListById(id: string, created_by_user_id?: string): Promise<ShoppingList | undefined> {
  const db = await getDB();
  const list = await db.get('shopping_lists', id) as ShoppingList | undefined;
  if (!list || (created_by_user_id && list.created_by_user_id !== created_by_user_id)) {
    throw { error: 'ERR_SHOPPING_LIST_NOT_FOUND' };
  }
  return list;
}

export async function updateShoppingList(id: string, name: string, created_by_user_id?: string): Promise<ShoppingList> {
  if (!name) throw { error: 'ERR_VALIDATION', message: 'Name is required' };
  const db = await getDB();
  const list = await db.get('shopping_lists', id) as ShoppingList | undefined;
  if (!list || (created_by_user_id && list.created_by_user_id !== created_by_user_id)) {
    throw { error: 'ERR_SHOPPING_LIST_NOT_FOUND' };
  }
  list.name = name;
  list.updated_at = new Date().toISOString();
  await db.put('shopping_lists', list);
  return list;
}

export async function deleteShoppingList(id: string, created_by_user_id?: string): Promise<void> {
  const db = await getDB();
  const list = await db.get('shopping_lists', id) as ShoppingList | undefined;
  if (!list || (created_by_user_id && list.created_by_user_id !== created_by_user_id)) {
    throw { error: 'ERR_SHOPPING_LIST_NOT_FOUND' };
  }
  try {
    await db.delete('shopping_lists', id);
  } catch (e) {
    throw { error: 'ERR_SHOPPING_LIST_DELETE_FAILED' };
  }
}
