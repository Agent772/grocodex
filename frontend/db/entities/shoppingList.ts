// CRUD utilities for shopping lists in IndexedDB
import { getDB } from '../index';
import { ShoppingList } from '../../types/entities';

/**
 * Creates a new shopping list with the specified name and optional creator user ID.
 *
 * @param name - The name of the shopping list. Must be a non-empty string.
 * @param created_by_user_id - (Optional) The ID of the user who created the shopping list.
 * @returns A promise that resolves to the newly created `ShoppingList` object.
 * @throws { error: 'ERR_VALIDATION', message: string } If the name is not provided.
 * @throws { error: 'ERR_SHOPPING_LIST_CREATE_FAILED' } If the shopping list could not be created in the database.
 */
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

/**
 * Retrieves all shopping lists from the database.
 *
 * If a `created_by_user_id` is provided, only returns shopping lists created by the specified user.
 *
 * @param created_by_user_id - (Optional) The ID of the user whose shopping lists should be retrieved.
 * @returns A promise that resolves to an array of `ShoppingList` objects.
 */
export async function getAllShoppingLists(created_by_user_id?: string): Promise<ShoppingList[]> {
  const db = await getDB();
  let lists = await db.getAll('shopping_lists') as ShoppingList[];
  if (created_by_user_id) {
    lists = lists.filter(l => l.created_by_user_id === created_by_user_id);
  }
  return lists;
}

/**
 * Retrieves a shopping list by its unique identifier.
 *
 * @param id - The unique identifier of the shopping list to retrieve.
 * @param created_by_user_id - (Optional) The user ID to verify ownership of the shopping list.
 * @returns A promise that resolves to the `ShoppingList` object if found and owned by the specified user (if provided), or `undefined` if not found.
 * @throws An object with `{ error: 'ERR_SHOPPING_LIST_NOT_FOUND' }` if the shopping list does not exist or does not belong to the specified user.
 */
export async function getShoppingListById(id: string, created_by_user_id?: string): Promise<ShoppingList | undefined> {
  const db = await getDB();
  const list = await db.get('shopping_lists', id) as ShoppingList | undefined;
  if (!list || (created_by_user_id && list.created_by_user_id !== created_by_user_id)) {
    throw { error: 'ERR_SHOPPING_LIST_NOT_FOUND' };
  }
  return list;
}

/**
 * Updates the name of an existing shopping list.
 *
 * @param id - The unique identifier of the shopping list to update.
 * @param name - The new name for the shopping list. Must not be empty.
 * @param created_by_user_id - (Optional) The user ID of the creator. If provided, ensures the list belongs to this user.
 * @returns A promise that resolves to the updated `ShoppingList` object.
 * @throws { error: 'ERR_VALIDATION', message: string } If the name is not provided.
 * @throws { error: 'ERR_SHOPPING_LIST_NOT_FOUND' } If the shopping list does not exist or does not belong to the user.
 */
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

/**
 * Deletes a shopping list by its ID.
 *
 * @param id - The unique identifier of the shopping list to delete.
 * @param created_by_user_id - (Optional) The user ID of the creator; if provided, ensures only the creator can delete the list.
 * @returns A promise that resolves when the shopping list is deleted.
 * @throws { error: 'ERR_SHOPPING_LIST_NOT_FOUND' } If the shopping list does not exist or the user is not authorized.
 * @throws { error: 'ERR_SHOPPING_LIST_DELETE_FAILED' } If the deletion operation fails.
 */
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
