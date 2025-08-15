// CRUD utilities for ProductGroup in IndexedDB
import { getDB } from '../index';
import { ProductGroup } from '../../types/entities';

/**
 * Retrieves all product groups from the database.
 */
export async function getAllProductGroups(): Promise<ProductGroup[]> {
  const db = await getDB();
  return db.getAll('product_groups');
}

/**
 * Retrieves a product group by its unique identifier.
 */
export async function getProductGroupById(id: string): Promise<ProductGroup | undefined> {
  const db = await getDB();
  const group = await db.get('product_groups', id);
  if (!group) throw { error: 'ERR_PRODUCTGROUP_NOT_FOUND' };
  return group;
}

/**
 * Adds or updates a product group in the database.
 */
export async function addOrUpdateProductGroup(group: ProductGroup): Promise<void> {
  const db = await getDB();
  try {
    await db.put('product_groups', group);
  } catch (e) {
    throw { error: 'ERR_PRODUCTGROUP_CREATE_FAILED' };
  }
}

/**
 * Deletes a product group from the database by its ID.
 */
export async function deleteProductGroup(id: string): Promise<void> {
  const db = await getDB();
  const group = await db.get('product_groups', id);
  if (!group) throw { error: 'ERR_PRODUCTGROUP_NOT_FOUND' };
  try {
    await db.delete('product_groups', id);
  } catch (e) {
    throw { error: 'ERR_PRODUCTGROUP_DELETE_FAILED' };
  }
}

/**
 * Searches product groups by name (exact match).
 */
export async function searchProductGroupsByName(name: string): Promise<ProductGroup[]> {
  const db = await getDB();
  return db.getAllFromIndex('product_groups', 'by-name', name);
}
