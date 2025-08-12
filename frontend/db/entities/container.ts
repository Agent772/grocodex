// CRUD utilities for containers in IndexedDB (local-first, i18n error keys)

import { getDB } from '../../db/index';
import { Container } from '../../types/entities';

/**
 * Adds a new container or updates an existing one in the IndexedDB.
 * Throws an error with the i18n key 'ERR_CONTAINER_CREATE_FAILED' if the operation fails.
 *
 * @param container - The container entity to add or update.
 * @returns A promise that resolves when the operation is complete.
 */
export async function addOrUpdateContainer(container: Container): Promise<void> {
  const db = await getDB();
  try {
    await db.put('containers', container);
  } catch (e) {
    throw { error: 'ERR_CONTAINER_CREATE_FAILED' };
  }
}

/**
 * Retrieves all containers from the IndexedDB.
 *
 * @returns A promise that resolves to an array of Container entities.
 */
export async function getAllContainers(): Promise<Container[]> {
  const db = await getDB();
  return db.getAll('containers') as Promise<Container[]>;
}

/**
 * Retrieves a container by its ID from the IndexedDB.
 * Throws an error with the i18n key 'ERR_CONTAINER_NOT_FOUND' if the container does not exist.
 *
 * @param id - The ID of the container to retrieve.
 * @returns A promise that resolves to the Container entity.
 */
export async function getContainerById(id: string): Promise<Container> {
  const db = await getDB();
  const container = await db.get('containers', id) as Container | undefined;
  if (!container) throw { error: 'ERR_CONTAINER_NOT_FOUND' };
  return container;
}

/**
 * Updates an existing container in the IndexedDB with the provided updates.
 * Throws an error with the i18n key 'ERR_CONTAINER_NOT_FOUND' if the container does not exist,
 * or 'ERR_CONTAINER_UPDATE_FAILED' if the update operation fails.
 *
 * @param id - The ID of the container to update.
 * @param updates - Partial updates to apply to the container.
 * @returns A promise that resolves to the updated Container entity.
 */
export async function updateContainer(id: string, updates: Partial<Container>): Promise<Container> {
  const db = await getDB();
  const container = await db.get('containers', id) as Container | undefined;
  if (!container) throw { error: 'ERR_CONTAINER_NOT_FOUND' };
  const updated = { ...container, ...updates };
  try {
    await db.put('containers', updated);
    return updated;
  } catch (e) {
    throw { error: 'ERR_CONTAINER_UPDATE_FAILED' };
  }
}

/**
 * Deletes a container by its ID from the IndexedDB.
 * Throws an error with the i18n key 'ERR_CONTAINER_NOT_FOUND' if the container does not exist,
 * or 'ERR_CONTAINER_DELETE_FAILED' if the delete operation fails.
 *
 * @param id - The ID of the container to delete.
 * @returns A promise that resolves to true if the deletion was successful.
 */
export async function deleteContainer(id: string): Promise<boolean> {
  const db = await getDB();
  const container = await db.get('containers', id) as Container | undefined;
  if (!container) throw { error: 'ERR_CONTAINER_NOT_FOUND' };
  try {
    await db.delete('containers', id);
    return true;
  } catch (e) {
    throw { error: 'ERR_CONTAINER_DELETE_FAILED' };
  }
}
