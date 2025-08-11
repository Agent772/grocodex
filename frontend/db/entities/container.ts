// CRUD utilities for containers in IndexedDB (local-first, i18n error keys)
import { getDB } from '../../db/index';
import { Container } from '../../types/entities';

export async function addOrUpdateContainer(container: Container): Promise<void> {
  const db = await getDB();
  try {
    await db.put('containers', container);
  } catch (e) {
    throw { error: 'ERR_CONTAINER_CREATE_FAILED' };
  }
}

export async function getAllContainers(): Promise<Container[]> {
  const db = await getDB();
  return db.getAll('containers') as Promise<Container[]>;
}

export async function getContainerById(id: string): Promise<Container> {
  const db = await getDB();
  const container = await db.get('containers', id) as Container | undefined;
  if (!container) throw { error: 'ERR_CONTAINER_NOT_FOUND' };
  return container;
}

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
