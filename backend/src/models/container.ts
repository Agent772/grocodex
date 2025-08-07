import db from '../db';

export async function createContainer(data: any) {
  const [id] = await db('container').insert(data);
  return getContainerById(id);
}

export async function getAllContainers() {
  return db('container').select('*');
}

export async function getContainerById(id: number) {
  return db('container').where({ id }).first();
}

export async function updateContainer(id: number, updates: any) {
  return db('container').where({ id }).update(updates);
}

export async function deleteContainer(id: number) {
  return db('container').where({ id }).del();
}
