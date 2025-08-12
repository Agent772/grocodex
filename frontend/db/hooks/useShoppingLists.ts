import { useCallback, useEffect, useState } from 'react';
import {
  createShoppingList,
  getAllShoppingLists,
  getShoppingListById,
  updateShoppingList,
  deleteShoppingList,
} from '../entities/shoppingList';
import { ShoppingList } from '../../types/entities';


/**
 * React hook for managing shopping lists, including fetching, creating, updating, and deleting lists.
 * 
 * @param created_by_user_id - (Optional) The user ID to filter shopping lists by creator.
 * @returns An object containing:
 * - `lists`: The array of shopping lists.
 * - `loading`: Boolean indicating if a request is in progress.
 * - `error`: Error message string or null.
 * - `refresh`: Function to manually refresh the shopping lists.
 * - `create`: Function to create a new shopping list.
 * - `update`: Function to update an existing shopping list's name.
 * - `remove`: Function to delete a shopping list by ID.
 * - `getById`: Function to fetch a shopping list by its ID.
 *
 * @example
 * const { lists, loading, error, create, update, remove, refresh, getById } = useShoppingLists(userId);
 */
export function useShoppingLists(created_by_user_id?: string) {
  const [lists, setLists] = useState<ShoppingList[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetches all shopping lists (optionally filtered by user) and updates state.
   */
  const fetchLists = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllShoppingLists(created_by_user_id);
      setLists(data);
    } catch (e: any) {
      setError(e?.error || 'ERR_SHOPPING_LIST_FETCH_FAILED');
    } finally {
      setLoading(false);
    }
  }, [created_by_user_id]);

  useEffect(() => {
    fetchLists();
  }, [fetchLists]);

  /**
   * Creates a new shopping list, then refreshes the list.
   */
  const create = useCallback(async (name: string) => {
    setError(null);
    try {
      await createShoppingList(name, created_by_user_id);
      await fetchLists();
    } catch (e: any) {
      setError(e?.error || 'ERR_SHOPPING_LIST_CREATE_FAILED');
    }
  }, [fetchLists, created_by_user_id]);

  /**
   * Updates a shopping list's name, then refreshes the list.
   */
  const update = useCallback(async (id: string, name: string) => {
    setError(null);
    try {
      await updateShoppingList(id, name, created_by_user_id);
      await fetchLists();
    } catch (e: any) {
      setError(e?.error || 'ERR_SHOPPING_LIST_UPDATE_FAILED');
    }
  }, [fetchLists, created_by_user_id]);

  /**
   * Deletes a shopping list by ID, then refreshes the list.
   */
  const remove = useCallback(async (id: string) => {
    setError(null);
    try {
      await deleteShoppingList(id, created_by_user_id);
      await fetchLists();
    } catch (e: any) {
      setError(e?.error || 'ERR_SHOPPING_LIST_DELETE_FAILED');
    }
  }, [fetchLists, created_by_user_id]);

  /**
   * Gets a shopping list by its ID.
   */
  const getById = useCallback(async (id: string) => {
    setError(null);
    try {
      return await getShoppingListById(id, created_by_user_id);
    } catch (e: any) {
      setError(e?.error || 'ERR_SHOPPING_LIST_NOT_FOUND');
      return undefined;
    }
  }, [created_by_user_id]);

  return {
    lists,
    loading,
    error,
    refresh: fetchLists,
    create,
    update,
    remove,
    getById,
  };
}
