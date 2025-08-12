// CRUD utilities for product categories in IndexedDB (local-first, i18n error keys)

import { getDB } from '../../db/index';
import { ProductCategory } from '../../types/entities';

/**
 * Adds a new product category or updates an existing one in IndexedDB.
 * Throws an error with key 'ERR_CATEGORY_CREATE' if the operation fails.
 * @param category - The product category to add or update.
 * @returns A promise that resolves when the operation is complete.
 */
export async function addOrUpdateCategory(category: ProductCategory): Promise<void> {
  const db = await getDB();
  try {
    await db.put('product_categories', category);
  } catch (e) {
    throw { error: 'ERR_CATEGORY_CREATE' };
  }
}

/**
 * Retrieves all product categories from IndexedDB, optionally filtering by name.
 * @param filter - Optional filter object with a 'name' property for case-insensitive matching.
 * @returns A promise that resolves to an array of matching ProductCategory objects.
 */
export async function getCategories(filter?: { name?: string }): Promise<ProductCategory[]> {
  const db = await getDB();
  let categories = await db.getAll('product_categories') as ProductCategory[];
  if (filter?.name) {
    categories = categories.filter(cat => cat.name && cat.name.toLowerCase().includes(filter.name!.toLowerCase()));
  }
  return categories;
}

/**
 * Retrieves a product category by its ID from IndexedDB.
 * Throws an error with key 'ERR_CATEGORY_NOT_FOUND' if the category does not exist.
 * @param id - The ID of the product category to retrieve.
 * @returns A promise that resolves to the found ProductCategory.
 */
export async function getCategoryById(id: string): Promise<ProductCategory> {
  const db = await getDB();
  const cat = await db.get('product_categories', id) as ProductCategory | undefined;
  if (!cat) throw { error: 'ERR_CATEGORY_NOT_FOUND' };
  return cat;
}

/**
 * Updates an existing product category in IndexedDB by ID.
 * Throws an error with key 'ERR_CATEGORY_NOT_FOUND' if the category does not exist,
 * or 'ERR_CATEGORY_UPDATE' if the update fails.
 * @param id - The ID of the product category to update.
 * @param updates - Partial object containing the fields to update.
 * @returns A promise that resolves to the updated ProductCategory.
 */
export async function updateCategory(id: string, updates: Partial<ProductCategory>): Promise<ProductCategory> {
  const db = await getDB();
  const cat = await db.get('product_categories', id) as ProductCategory | undefined;
  if (!cat) throw { error: 'ERR_CATEGORY_NOT_FOUND' };
  const updated = { ...cat, ...updates };
  try {
    await db.put('product_categories', updated);
    return updated;
  } catch (e) {
    throw { error: 'ERR_CATEGORY_UPDATE' };
  }
}

/**
 * Deletes a product category by its ID from IndexedDB.
 * Throws an error with key 'ERR_CATEGORY_NOT_FOUND' if the category does not exist,
 * or 'ERR_CATEGORY_DELETE' if the deletion fails.
 * @param id - The ID of the product category to delete.
 * @returns A promise that resolves to true if the deletion was successful.
 */
export async function deleteCategory(id: string): Promise<boolean> {
  const db = await getDB();
  const cat = await db.get('product_categories', id) as ProductCategory | undefined;
  if (!cat) throw { error: 'ERR_CATEGORY_NOT_FOUND' };
  try {
    await db.delete('product_categories', id);
    return true;
  } catch (e) {
    throw { error: 'ERR_CATEGORY_DELETE' };
  }
}
