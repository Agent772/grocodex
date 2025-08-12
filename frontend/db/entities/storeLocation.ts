// CRUD utilities for store locations in IndexedDB (local-first, i18n error keys)
import { getDB } from '../../db/index';
import { SupermarketProduct } from '../../types/entities';

/**
 * Represents the filter criteria for querying store locations.
 *
 * @property supermarket_id - (Optional) The unique identifier of the supermarket.
 * @property product_id - (Optional) The unique identifier of the product.
 * @property location - (Optional) The specific location within the store.
 */
export interface StoreLocationFilter {
  supermarket_id?: string;
  product_id?: string;
  location?: string;
}

/**
 * Adds a new store location or updates an existing one in the 'supermarket_products' store.
 *
 * @param loc - The `SupermarketProduct` object representing the store location to add or update.
 * @returns A promise that resolves when the operation is complete.
 * @throws An object with `{ error: 'ERR_STORE_LOCATION_CREATE' }` if the operation fails.
 */
export async function addOrUpdateStoreLocation(loc: SupermarketProduct): Promise<void> {
  const db = await getDB();
  try {
    await db.put('supermarket_products', loc);
  } catch (e) {
    throw { error: 'ERR_STORE_LOCATION_CREATE' };
  }
}

/**
 * Retrieves a list of supermarket product locations from the database, optionally filtered by supermarket ID, product ID, or location name.
 *
 * @param filter - An optional object specifying filter criteria:
 *   - `supermarket_id` (string): Filter by the supermarket's unique identifier.
 *   - `product_id` (string): Filter by the product's unique identifier.
 *   - `location` (string): Filter by a substring match in the location name (case-insensitive).
 * @returns A promise that resolves to an array of `SupermarketProduct` objects matching the filter criteria.
 */
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

/**
 * Retrieves a supermarket product (store location) by its unique identifier.
 *
 * @param id - The unique identifier of the supermarket product to retrieve.
 * @returns A promise that resolves to the `SupermarketProduct` if found.
 * @throws An error object with `{ error: 'ERR_STORE_LOCATION_NOT_FOUND' }` if the product is not found.
 */
export async function getStoreLocationById(id: string): Promise<SupermarketProduct> {
  const db = await getDB();
  const loc = await db.get('supermarket_products', id) as SupermarketProduct | undefined;
  if (!loc) throw { error: 'ERR_STORE_LOCATION_NOT_FOUND' };
  return loc;
}

/**
 * Updates a supermarket product (store location) in the database with the specified changes.
 *
 * @param id - The unique identifier of the supermarket product to update.
 * @param updates - An object containing the fields to update in the supermarket product.
 * @returns A promise that resolves to the updated `SupermarketProduct`.
 * @throws An error object with `error: 'ERR_STORE_LOCATION_NOT_FOUND'` if the product is not found.
 * @throws An error object with `error: 'ERR_STORE_LOCATION_UPDATE'` if the update operation fails.
 */
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

/**
 * Deletes a store location from the 'supermarket_products' database by its ID.
 *
 * @param id - The unique identifier of the store location to delete.
 * @returns A promise that resolves to `true` if the deletion was successful.
 * @throws An object with `error: 'ERR_STORE_LOCATION_NOT_FOUND'` if the store location does not exist.
 * @throws An object with `error: 'ERR_STORE_LOCATION_DELETE'` if the deletion fails for any other reason.
 */
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
