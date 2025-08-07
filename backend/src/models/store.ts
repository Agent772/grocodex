import db from '../db';

export async function createStore(data: { name: string; location?: string; created_by_user_id: number }) {
  return db('supermarket').insert(data).returning('*');
}

export async function getStores(filter?: { name?: string }) {
  let query = db('supermarket');
  if (filter?.name) query = query.where('name', 'like', `%${filter.name}%`);
  return query;
}

export async function getStoreById(id: number) {
  return db('supermarket').where({ id }).first();
}

export async function updateStore(id: number, data: Partial<{ name: string; location: string }>) {
  return db('supermarket').where({ id }).update(data).returning('*');
}

export async function deleteStore(id: number) {
  return db('supermarket').where({ id }).del();
}
