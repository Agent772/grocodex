import { useCallback, useState } from 'react';
import {
  addOrUpdateShoppingListItem,
  deleteShoppingListItem,
  deleteShoppingListItems,
  markShoppingListItemsComplete,
  batchAddShoppingListItems,
  getShoppingListItems,
} from '../entities/shoppingListItem';
import React from 'react';
import { ShoppingListItem } from '../../types/entities';


/**
 * React hook for managing shopping list items for a specific shopping list.
 *
 * Provides state and CRUD operations for shopping list items, including batch actions.
 * Handles loading and error states automatically, and refreshes the list after mutations.
 *
 * @param shopping_list_id - The unique identifier of the shopping list to manage items for.
 * @returns An object containing:
 *   - `items`: The current array of shopping list items.
 *   - `loading`: Whether the items are currently being loaded.
 *   - `error`: Any error message encountered during operations, or `null`.
 *   - `refresh`: Function to manually refresh the list of items.
 *   - `addOrUpdate`: Function to add or update a single shopping list item.
 *   - `remove`: Function to delete a single shopping list item by ID.
 *   - `removeBatch`: Function to delete multiple shopping list items by their IDs.
 *   - `markCompleteBatch`: Function to mark multiple items as complete.
 *   - `addBatch`: Function to add multiple items to the shopping list in a batch operation.
 *
 * @example
 * ```tsx
 * const {
 *   items,
 *   loading,
 *   error,
 *   addOrUpdate,
 *   remove,
 *   removeBatch,
 *   markCompleteBatch,
 *   addBatch,
 *   refresh,
 * } = useShoppingListItems('list-id');
 * ```
 */
export function useShoppingListItems(shopping_list_id: string) {
  const [items, setItems] = useState<ShoppingListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetches all items for the given shopping list and updates state.
   */
  const fetchItems = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getShoppingListItems(shopping_list_id);
      setItems(data);
    } catch (e: any) {
      setError(e?.error || 'ERR_SHOPPING_LIST_ITEM_FETCH_FAILED');
    } finally {
      setLoading(false);
    }
  }, [shopping_list_id]);

  // Fetch items on mount and when shopping_list_id changes
  React.useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  /**
   * Adds or updates a single shopping list item, then refreshes the list.
   */
  const addOrUpdate = useCallback(async (item: ShoppingListItem) => {
    setError(null);
    try {
      await addOrUpdateShoppingListItem(item);
      await fetchItems();
    } catch (e: any) {
      setError(e?.error || 'ERR_SHOPPING_LIST_ITEM_CREATE_FAILED');
    }
  }, [fetchItems]);

  /**
   * Deletes a single shopping list item by ID, then refreshes the list.
   */
  const remove = useCallback(async (id: string) => {
    setError(null);
    try {
      await deleteShoppingListItem(id);
      await fetchItems();
    } catch (e: any) {
      setError(e?.error || 'ERR_SHOPPING_LIST_ITEM_DELETE_FAILED');
    }
  }, [fetchItems]);

  /**
   * Deletes multiple shopping list items by their IDs, then refreshes the list.
   */
  const removeBatch = useCallback(async (ids: string[]) => {
    setError(null);
    try {
      await deleteShoppingListItems(ids);
      await fetchItems();
    } catch (e: any) {
      setError(e?.error || 'ERR_SHOPPING_LIST_ITEM_BATCH_DELETE_FAILED');
    }
  }, [fetchItems]);

  /**
   * Marks multiple shopping list items as complete, then refreshes the list.
   */
  const markCompleteBatch = useCallback(async (ids: string[]) => {
    setError(null);
    try {
      await markShoppingListItemsComplete(ids);
      await fetchItems();
    } catch (e: any) {
      setError(e?.error || 'ERR_SHOPPING_LIST_ITEM_BATCH_COMPLETE_FAILED');
    }
  }, [fetchItems]);

  /**
   * Adds multiple items to a shopping list in a batch operation, then refreshes the list.
   */
  const addBatch = useCallback(async (
    itemsToAdd: Omit<ShoppingListItem, 'id' | 'shopping_list_id' | 'created_at'>[],
    created_by_user_id?: string
  ) => {
    setError(null);
    try {
      await batchAddShoppingListItems(shopping_list_id, itemsToAdd, created_by_user_id);
      await fetchItems();
    } catch (e: any) {
      setError(e?.error || 'ERR_SHOPPING_LIST_ITEM_BATCH_ADD_FAILED');
    }
  }, [fetchItems, shopping_list_id]);

  return {
    items,
    loading,
    error,
    refresh: fetchItems,
    addOrUpdate,
    remove,
    removeBatch,
    markCompleteBatch,
    addBatch,
  };
}
