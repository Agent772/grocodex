// CRUD utilities for store locations in IndexedDB (local-first, i18n error keys)
import { getDB } from '../../db/index';
import { SupermarketProduct } from '../../types/entities';

export interface StoreLocationFilter {
  supermarket_id?: string;
  product_id?: string;
  location?: string;
}

export async function addOrUpdateStoreLocation(loc: SupermarketProduct): Promise<void> {
  const db = await getDB();
  try {
    await db.put('supermarket_products', loc);
  } catch (e) {
    throw { error: 'ERR_STORE_LOCATION_CREATE' };
  }
}

export async function getStoreLocations(filter: StoreLocationFilter = {}): Promise<SupermarketProduct[]> {
  const db = await getDB();
  let locations = await db.getAll('supermarket_products') as SupermarketProduct[];
  if (filter.supermarket_id) {
    locations = locations.filter(l => l.supermarket_id === filter.supermarket_id);
  }
  if (filter.product_id) {
    locations = locations.filter(l => l.product_id === filter.product_id);
  }
  if (filter.location) {
    locations = locations.filter(l => l.location && l.location.toLowerCase().includes(filter.location!.toLowerCase()));
  }
  return locations;
}

export async function getStoreLocationById(id: string): Promise<SupermarketProduct> {
  const db = await getDB();
  const loc = await db.get('supermarket_products', id) as SupermarketProduct | undefined;
  if (!loc) throw { error: 'ERR_STORE_LOCATION_NOT_FOUND' };
  return loc;
}

export async function updateStoreLocation(id: string, updates: Partial<SupermarketProduct>): Promise<SupermarketProduct> {
  const db = await getDB();
  const loc = await db.get('supermarket_products', id) as SupermarketProduct | undefined;
  if (!loc) throw { error: 'ERR_STORE_LOCATION_NOT_FOUND' };
  const updated = { ...loc, ...updates };
  try {
    await db.put('supermarket_products', updated);
    return updated;
  } catch (e) {
    throw { error: 'ERR_STORE_LOCATION_UPDATE' };
  }
}

export async function deleteStoreLocation(id: string): Promise<boolean> {
  const db = await getDB();
  const loc = await db.get('supermarket_products', id) as SupermarketProduct | undefined;
  if (!loc) throw { error: 'ERR_STORE_LOCATION_NOT_FOUND' };
  try {
    await db.delete('supermarket_products', id);
    return true;
  } catch (e) {
    throw { error: 'ERR_STORE_LOCATION_DELETE' };
  }
}
