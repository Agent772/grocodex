// CRUD utilities for stores in IndexedDB (local-first, i18n error keys)
import { getDB } from '../../db/index';
import { Supermarket } from '../../types/entities';

export async function addOrUpdateStore(store: Supermarket): Promise<void> {
  const db = await getDB();
  try {
    await db.put('supermarkets', store);
  } catch (e) {
    throw { error: 'ERR_STORE_CREATE' };
  }
}

export async function getStores(filter?: { name?: string }): Promise<Supermarket[]> {
  const db = await getDB();
  let stores = await db.getAll('supermarkets') as Supermarket[];
  if (filter?.name) {
    stores = stores.filter(store => store.name && store.name.toLowerCase().includes(filter.name!.toLowerCase()));
  }
  return stores;
}

export async function getStoreById(id: string): Promise<Supermarket> {
  const db = await getDB();
  const store = await db.get('supermarkets', id) as Supermarket | undefined;
  if (!store) throw { error: 'ERR_STORE_NOT_FOUND' };
  return store;
}

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
