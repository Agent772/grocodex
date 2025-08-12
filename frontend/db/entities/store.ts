// CRUD utilities for stores in IndexedDB (local-first, i18n error keys)
import { getDB } from '../../db/index';
import { Supermarket } from '../../types/entities';

/**
 * Adds a new supermarket to the database or updates an existing one.
 *
 * This function attempts to insert or update a `Supermarket` entity
 * in the 'supermarkets' object store of the database. If the operation
 * fails, it throws an error with the code 'ERR_STORE_CREATE'.
 *
 * @param store - The `Supermarket` object to add or update in the database.
 * @returns A promise that resolves when the operation is complete.
 * @throws An object with `{ error: 'ERR_STORE_CREATE' }` if the operation fails.
 */
export async function addOrUpdateStore(store: Supermarket): Promise<void> {
  const db = await getDB();
  try {
    await db.put('supermarkets', store);
  } catch (e) {
    throw { error: 'ERR_STORE_CREATE' };
  }
}

/**
 * Retrieves a list of supermarkets from the database, optionally filtered by name.
 *
 * @param filter - Optional filter object to narrow down the results.
 * @param filter.name - If provided, only supermarkets whose names include this string (case-insensitive) will be returned.
 * @returns A promise that resolves to an array of `Supermarket` objects matching the filter criteria.
 */
export async function getStores(filter?: { name?: string }): Promise<Supermarket[]> {
  const db = await getDB();
  let stores = await db.getAll('supermarkets') as Supermarket[];
  if (filter?.name) {
    stores = stores.filter(store => store.name && store.name.toLowerCase().includes(filter.name!.toLowerCase()));
  }
  return stores;
}

/**
 * Retrieves a supermarket by its unique identifier.
 *
 * @param id - The unique identifier of the supermarket to retrieve.
 * @returns A promise that resolves to the `Supermarket` object if found.
 * @throws An error object with `{ error: 'ERR_STORE_NOT_FOUND' }` if the supermarket does not exist.
 */
export async function getStoreById(id: string): Promise<Supermarket> {
  const db = await getDB();
  const store = await db.get('supermarkets', id) as Supermarket | undefined;
  if (!store) throw { error: 'ERR_STORE_NOT_FOUND' };
  return store;
}

/**
 * Updates a supermarket store entry in the database with the provided updates.
 *
 * @param id - The unique identifier of the supermarket to update.
 * @param updates - A partial object containing the fields to update in the supermarket.
 * @returns A promise that resolves to the updated `Supermarket` object.
 * @throws { error: 'ERR_STORE_NOT_FOUND' } If the supermarket with the given ID does not exist.
 * @throws { error: 'ERR_STORE_UPDATE' } If there is an error while updating the supermarket in the database.
 */
export async function updateStore(id: string, updates: Partial<Supermarket>): Promise<Supermarket> {
  const db = await getDB();
  const store = await db.get('supermarkets', id) as Supermarket | undefined;
  if (!store) throw { error: 'ERR_STORE_NOT_FOUND' };
  const updated = { ...store, ...updates };
  try {
    await db.put('supermarkets', updated);
    return updated;
  } catch (e) {
    throw { error: 'ERR_STORE_UPDATE' };
  }
}

/**
 * Deletes a supermarket store by its ID.
 *
 * @param id - The unique identifier of the store to delete.
 * @returns A promise that resolves to `true` if the store was successfully deleted.
 * @throws An object with `error: 'ERR_STORE_NOT_FOUND'` if the store does not exist.
 * @throws An object with `error: 'ERR_STORE_DELETE'` if the deletion fails for any other reason.
 */
export async function deleteStore(id: string): Promise<boolean> {
  const db = await getDB();
  const store = await db.get('supermarkets', id) as Supermarket | undefined;
  if (!store) throw { error: 'ERR_STORE_NOT_FOUND' };
  try {
    await db.delete('supermarkets', id);
    return true;
  } catch (e) {
    throw { error: 'ERR_STORE_DELETE' };
  }
}
