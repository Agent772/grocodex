import { useCallback, useEffect, useState } from 'react';
import {
  getAllProductGroups,
  getProductGroupById,
  addOrUpdateProductGroup,
  deleteProductGroup,
  searchProductGroupsByName,
} from '../entities/productGroup';
import { ProductGroup } from '../../types/entities';

/**
 * React hook for managing and interacting with product groups in IndexedDB.
 *
 * Provides state and CRUD operations for product groups, including:
 * - Fetching all product groups
 * - Adding or updating a product group
 * - Deleting a product group
 * - Searching product groups by name
 *
 * Handles loading and error states automatically.
 */
export function useProductGroups() {
  const [groups, setGroups] = useState<ProductGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetches all product groups from IndexedDB and updates state.
   */
  const fetchGroups = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllProductGroups();
      setGroups(data);
    } catch (e: any) {
      setError(e?.error || 'ERR_PRODUCTGROUP_FETCH_FAILED');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  /**
   * Adds or updates a product group, then refreshes the list.
   */
  const addOrUpdate = useCallback(async (group: ProductGroup) => {
    setError(null);
    try {
      await addOrUpdateProductGroup(group);
      await fetchGroups();
    } catch (e: any) {
      setError(e?.error || 'ERR_PRODUCTGROUP_CREATE_FAILED');
    }
  }, [fetchGroups]);

  /**
   * Deletes a product group by ID, then refreshes the list.
   */
  const remove = useCallback(async (id: string) => {
    setError(null);
    try {
      await deleteProductGroup(id);
      await fetchGroups();
    } catch (e: any) {
      setError(e?.error || 'ERR_PRODUCTGROUP_DELETE_FAILED');
    }
  }, [fetchGroups]);

  /**
   * Gets a product group by its ID.
   */
  const getById = useCallback(async (id: string) => {
    setError(null);
    try {
      return await getProductGroupById(id);
    } catch (e: any) {
      setError(e?.error || 'ERR_PRODUCTGROUP_NOT_FOUND');
      return undefined;
    }
  }, []);

  /**
   * Searches product groups by name.
   */
  const searchByName = useCallback(async (name: string) => {
    setError(null);
    try {
      return await searchProductGroupsByName(name);
    } catch (e: any) {
      setError(e?.error || 'ERR_PRODUCTGROUP_FETCH_FAILED');
      return [];
    }
  }, []);

  return {
    groups,
    loading,
    error,
    refresh: fetchGroups,
    addOrUpdate,
    remove,
    getById,
    searchByName,
  };
}
