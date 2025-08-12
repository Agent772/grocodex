import { useCallback, useEffect, useState } from 'react';
import {
  addOrUpdateStoreLocation,
  getStoreLocations,
  getStoreLocationById,
  updateStoreLocation,
  deleteStoreLocation,
  StoreLocationFilter,
} from '../entities/storeLocation';
import { SupermarketProduct } from '../../types/entities';


/**
 * React hook for managing supermarket store locations.
 *
 * Provides state and CRUD operations for store locations, including:
 * - Fetching all locations (with optional filtering)
 * - Adding or updating a location
 * - Updating a location by ID
 * - Deleting a location by ID
 * - Fetching a location by ID
 *
 * Handles loading and error states automatically.
 *
 * @param filter Optional filter to apply when fetching store locations.
 * @returns An object containing:
 *   - `locations`: The list of store locations.
 *   - `loading`: Whether a fetch operation is in progress.
 *   - `error`: Any error encountered during operations.
 *   - `refresh`: Function to manually refresh the locations list.
 *   - `addOrUpdate`: Function to add or update a store location.
 *   - `update`: Function to update a store location by ID.
 *   - `remove`: Function to delete a store location by ID.
 *   - `getById`: Function to fetch a store location by ID.
 */
export function useStoreLocations(filter: StoreLocationFilter = {}) {
  const [locations, setLocations] = useState<SupermarketProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetches all store locations (optionally filtered) and updates state.
   */
  const fetchLocations = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getStoreLocations(filter);
      setLocations(data);
    } catch (e: any) {
      setError(e?.error || 'ERR_STORE_LOCATION_FETCH_FAILED');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchLocations();
  }, [fetchLocations]);

  /**
   * Adds or updates a store location, then refreshes the list.
   */
  const addOrUpdate = useCallback(async (loc: SupermarketProduct) => {
    setError(null);
    try {
      await addOrUpdateStoreLocation(loc);
      await fetchLocations();
    } catch (e: any) {
      setError(e?.error || 'ERR_STORE_LOCATION_CREATE');
    }
  }, [fetchLocations]);

  /**
   * Updates a store location by ID, then refreshes the list.
   */
  const update = useCallback(async (id: string, updates: Partial<SupermarketProduct>) => {
    setError(null);
    try {
      await updateStoreLocation(id, updates);
      await fetchLocations();
    } catch (e: any) {
      setError(e?.error || 'ERR_STORE_LOCATION_UPDATE');
    }
  }, [fetchLocations]);

  /**
   * Deletes a store location by ID, then refreshes the list.
   */
  const remove = useCallback(async (id: string) => {
    setError(null);
    try {
      await deleteStoreLocation(id);
      await fetchLocations();
    } catch (e: any) {
      setError(e?.error || 'ERR_STORE_LOCATION_DELETE');
    }
  }, [fetchLocations]);

  /**
   * Gets a store location by its ID.
   */
  const getById = useCallback(async (id: string) => {
    setError(null);
    try {
      return await getStoreLocationById(id);
    } catch (e: any) {
      setError(e?.error || 'ERR_STORE_LOCATION_NOT_FOUND');
      return undefined;
    }
  }, []);

  return {
    locations,
    loading,
    error,
    refresh: fetchLocations,
    addOrUpdate,
    update,
    remove,
    getById,
  };
}
