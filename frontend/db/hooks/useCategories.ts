import { useCallback, useEffect, useState } from 'react';
import {
  addOrUpdateCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory
} from '../entities/category';
import { ProductCategory } from '../../types/entities';

/**
 * React hook for managing product categories with CRUD operations.
 *
 * Fetches, adds, updates, and deletes product categories, and provides loading and error states.
 * Optionally filters categories by name.
 *
 * @param filter - Optional filter object to filter categories by name.
 * @returns An object containing:
 * - `categories`: The current list of product categories.
 * - `loading`: Boolean indicating if categories are being loaded.
 * - `error`: Error message if fetching categories failed, otherwise `null`.
 * - `refresh`: Function to manually refresh the category list.
 * - `addCategory`: Function to add a new category.
 * - `updateCategory`: Function to update an existing category by ID.
 * - `deleteCategory`: Function to delete a category by ID.
 * - `getCategoryById`: Function to fetch a category by its ID.
 */
export function useCategories(filter?: { name?: string }) {
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const cats = await getCategories(filter);
      setCategories(cats);
    } catch (e: any) {
      setError(e?.error || 'ERR_CATEGORY_LIST');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const addCategory = useCallback(async (cat: ProductCategory) => {
    await addOrUpdateCategory(cat);
    await fetchCategories();
  }, [fetchCategories]);

  const update = useCallback(async (id: string, updates: Partial<ProductCategory>) => {
    await updateCategory(id, updates);
    await fetchCategories();
  }, [fetchCategories]);

  const remove = useCallback(async (id: string) => {
    await deleteCategory(id);
    await fetchCategories();
  }, [fetchCategories]);

  const getById = useCallback(async (id: string) => {
    return getCategoryById(id);
  }, []);

  return {
    categories,
    loading,
    error,
    refresh: fetchCategories,
    addCategory,
    updateCategory: update,
    deleteCategory: remove,
    getCategoryById: getById,
  };
}
