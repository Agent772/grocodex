import { useCallback, useEffect, useState } from 'react';
import {
  addOrUpdateContainer,
  getAllContainers,
  getContainerById,
  updateContainer,
  deleteContainer,
} from '../entities/container';
import { Container } from '../../types/entities';

/**
 * React hook for managing a list of containers with CRUD operations.
 *
 * This hook provides state and functions to fetch, add, update, and remove containers,
 * as well as retrieve a container by its ID. It also manages loading and error states.
 *
 * @returns An object containing:
 * - `containers`: The current list of containers.
 * - `loading`: Boolean indicating if a fetch operation is in progress.
 * - `error`: Error message string or null if no error.
 * - `refresh`: Function to re-fetch the list of containers.
 * - `addOrUpdate`: Function to add a new container or update an existing one.
 * - `update`: Function to update an existing container by ID.
 * - `remove`: Function to delete a container by ID.
 * - `getById`: Function to fetch a container by its ID.
 *
 * @example
 * const { containers, loading, error, addOrUpdate, remove } = useContainers();
 */
export function useContainers() {
  const [containers, setContainers] = useState<Container[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchContainers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllContainers();
      setContainers(data);
    } catch (e: any) {
      setError(e?.error || 'ERR_CONTAINER_FETCH_FAILED');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchContainers();
  }, [fetchContainers]);

  const addOrUpdate = useCallback(async (container: Container) => {
    setError(null);
    try {
      await addOrUpdateContainer(container);
      await fetchContainers();
    } catch (e: any) {
      setError(e?.error || 'ERR_CONTAINER_CREATE_FAILED');
    }
  }, [fetchContainers]);

  const update = useCallback(async (id: string, updates: Partial<Container>) => {
    setError(null);
    try {
      await updateContainer(id, updates);
      await fetchContainers();
    } catch (e: any) {
      setError(e?.error || 'ERR_CONTAINER_UPDATE_FAILED');
    }
  }, [fetchContainers]);

  const remove = useCallback(async (id: string) => {
    setError(null);
    try {
      await deleteContainer(id);
      await fetchContainers();
    } catch (e: any) {
      setError(e?.error || 'ERR_CONTAINER_DELETE_FAILED');
    }
  }, [fetchContainers]);

  const getById = useCallback(async (id: string) => {
    setError(null);
    try {
      return await getContainerById(id);
    } catch (e: any) {
      setError(e?.error || 'ERR_CONTAINER_NOT_FOUND');
      return undefined;
    }
  }, []);

  return {
    containers,
    loading,
    error,
    refresh: fetchContainers,
    addOrUpdate,
    update,
    remove,
    getById,
  };
}
