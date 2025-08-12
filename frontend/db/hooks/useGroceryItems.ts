import { useCallback, useEffect, useState } from 'react';
import {
  getAllGroceryItems,
  getGroceryItemById,
  addOrUpdateGroceryItem,
  deleteGroceryItem,
  getGroceryItemsByBarcode,
  deleteGroceryItemsByProductId,
} from '../entities/groceryItem';
import { GroceryItem } from '../../types/entities';
import { GroceryItemQuery } from '../entities/groceryItem';

/**
 * React hook for managing grocery items with CRUD operations and error/loading state.
 *
 * @param query - Optional query object to filter grocery items.
 * @returns An object containing:
 * - `items`: The current list of grocery items.
 * - `loading`: Boolean indicating if items are being loaded.
 * - `error`: Error message string or null.
 * - `refresh`: Function to re-fetch grocery items.
 * - `addOrUpdate`: Function to add a new grocery item or update an existing one.
 * - `remove`: Function to remove a grocery item by its ID.
 * - `removeByProductId`: Function to remove grocery items by product ID.
 * - `getById`: Function to fetch a grocery item by its ID.
 * - `getByBarcode`: Function to fetch grocery items by barcode.
 *
 * @example
 * const {
 *   items, loading, error, refresh, addOrUpdate, remove, removeByProductId, getById, getByBarcode
 * } = useGroceryItems({ category: 'fruits' });
 */
export function useGroceryItems(query: GroceryItemQuery = {}) {
  const [items, setItems] = useState<GroceryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllGroceryItems(query);
      setItems(data);
    } catch (e: any) {
      setError(e?.error || 'ERR_GROCERY_ITEM_FETCH_FAILED');
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const addOrUpdate = useCallback(async (item: GroceryItem) => {
    setError(null);
    try {
      await addOrUpdateGroceryItem(item);
      await fetchItems();
    } catch (e: any) {
      setError(e?.error || 'ERR_GROCERY_ITEM_CREATE_FAILED');
    }
  }, [fetchItems]);

  const remove = useCallback(async (id: string) => {
    setError(null);
    try {
      await deleteGroceryItem(id);
      await fetchItems();
    } catch (e: any) {
      setError(e?.error || 'ERR_GROCERY_ITEM_DELETE_FAILED');
    }
  }, [fetchItems]);

  const removeByProductId = useCallback(async (product_id: string) => {
    setError(null);
    try {
      await deleteGroceryItemsByProductId(product_id);
      await fetchItems();
    } catch (e: any) {
      setError(e?.error || 'ERR_GROCERY_ITEM_DELETE_FAILED');
    }
  }, [fetchItems]);

  const getById = useCallback(async (id: string) => {
    setError(null);
    try {
      return await getGroceryItemById(id);
    } catch (e: any) {
      setError(e?.error || 'ERR_GROCERY_ITEM_NOT_FOUND');
      return undefined;
    }
  }, []);

  const getByBarcode = useCallback(async (barcode: string) => {
    setError(null);
    try {
      return await getGroceryItemsByBarcode(barcode);
    } catch (e: any) {
      setError(e?.error || 'ERR_GROCERY_ITEM_FETCH_FAILED');
      return [];
    }
  }, []);

  return {
    items,
    loading,
    error,
    refresh: fetchItems,
    addOrUpdate,
    remove,
    removeByProductId,
    getById,
    getByBarcode,
  };
}
