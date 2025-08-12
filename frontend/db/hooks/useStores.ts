import { useCallback, useEffect, useState } from 'react';
import {
  addOrUpdateStore,
  getStores,
  getStoreById,
  updateStore,
  deleteStore,
} from '../entities/store';
import { Supermarket } from '../../types/entities';


/**
 * React hook for managing a list of supermarkets (stores) with CRUD operations.
 *
 * Provides state and functions to fetch, add, update, and delete stores, as well as to retrieve a store by its ID.
 * Optionally supports filtering stores by name.
 *
 * @param filter - Optional filter object to filter stores by name.
 * @returns An object containing:
 *   - `stores`: The current list of stores.
 *   - `loading`: Boolean indicating if a fetch operation is in progress.
 *   - `error`: Error message string or null if no error.
 *   - `refresh`: Function to manually refresh the store list.
 *   - `addOrUpdate`: Function to add a new store or update an existing one.
 *   - `update`: Function to update a store by its ID.
 *   - `remove`: Function to delete a store by its ID.
 *   - `getById`: Function to fetch a store by its ID.
 */
export function useStores(filter?: { name?: string }) {
  const [stores, setStores] = useState<Supermarket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetches all stores (optionally filtered by name) and updates state.
   */
  const fetchStores = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getStores(filter);
      setStores(data);
    } catch (e: any) {
      setError(e?.error || 'ERR_STORE_FETCH_FAILED');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchStores();
  }, [fetchStores]);

  /**
   * Adds or updates a store, then refreshes the store list.
   */
  const addOrUpdate = useCallback(async (store: Supermarket) => {
    setError(null);
    try {
      await addOrUpdateStore(store);
      await fetchStores();
    } catch (e: any) {
      setError(e?.error || 'ERR_STORE_CREATE');
    }
  }, [fetchStores]);

  /**
   * Updates a store by ID, then refreshes the store list.
   */
  const update = useCallback(async (id: string, updates: Partial<Supermarket>) => {
    setError(null);
    try {
      await updateStore(id, updates);
      await fetchStores();
    } catch (e: any) {
      setError(e?.error || 'ERR_STORE_UPDATE');
    }
  }, [fetchStores]);

  /**
   * Deletes a store by ID, then refreshes the store list.
   */
  const remove = useCallback(async (id: string) => {
    setError(null);
    try {
      await deleteStore(id);
      await fetchStores();
    } catch (e: any) {
      setError(e?.error || 'ERR_STORE_DELETE');
    }
  }, [fetchStores]);

  /**
   * Gets a store by its ID.
   */
  const getById = useCallback(async (id: string) => {
    setError(null);
    try {
      return await getStoreById(id);
    } catch (e: any) {
      setError(e?.error || 'ERR_STORE_NOT_FOUND');
      return undefined;
    }
  }, []);

  return {
    stores,
    loading,
    error,
    refresh: fetchStores,
    addOrUpdate,
    update,
    remove,
    getById,
  };
}
