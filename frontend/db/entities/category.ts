// CRUD utilities for product categories in IndexedDB (local-first, i18n error keys)
import { getDB } from '../../db/index';
import { ProductCategory } from '../../types/entities';

export async function addOrUpdateCategory(category: ProductCategory): Promise<void> {
  const db = await getDB();
  try {
    await db.put('product_categories', category);
  } catch (e) {
    throw { error: 'ERR_CATEGORY_CREATE' };
  }
}

export async function getCategories(filter?: { name?: string }): Promise<ProductCategory[]> {
  const db = await getDB();
  let categories = await db.getAll('product_categories') as ProductCategory[];
  if (filter?.name) {
    categories = categories.filter(cat => cat.name && cat.name.toLowerCase().includes(filter.name!.toLowerCase()));
  }
  return categories;
}

export async function getCategoryById(id: string): Promise<ProductCategory> {
  const db = await getDB();
  const cat = await db.get('product_categories', id) as ProductCategory | undefined;
  if (!cat) throw { error: 'ERR_CATEGORY_NOT_FOUND' };
  return cat;
}

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
