import db from '../db';

export async function createStoreLocation(data: { product_id: number; supermarket_id: number; location?: string; created_by_user_id: number }) {
  return db('supermarket_product').insert(data).returning('*');
}

export async function getStoreLocations(filter?: { supermarket_id?: number; product_id?: number; location?: string }) {
  let query = db('supermarket_product');
  if (filter?.supermarket_id) query = query.where('supermarket_id', filter.supermarket_id);
  if (filter?.product_id) query = query.where('product_id', filter.product_id);
  if (filter?.location) query = query.where('location', 'like', `%${filter.location}%`);
  return query;
}

export async function getStoreLocationById(id: number) {
  return db('supermarket_product').where({ id }).first();
}

export async function updateStoreLocation(id: number, data: Partial<{ product_id: number; supermarket_id: number; location: string }>) {
  return db('supermarket_product').where({ id }).update(data).returning('*');
}

export async function deleteStoreLocation(id: number) {
  return db('supermarket_product').where({ id }).del();
}
