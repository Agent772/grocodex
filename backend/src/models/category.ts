import db from '../db';

export async function createCategory(data: { name: string; description?: string; created_by_user_id: number }) {
  return db('product_category').insert(data).returning('*');
}

export async function getCategories(filter?: { name?: string }) {
  let query = db('product_category');
  if (filter?.name) query = query.where('name', 'like', `%${filter.name}%`);
  return query;
}

export async function getCategoryById(id: number) {
  return db('product_category').where({ id }).first();
}

export async function updateCategory(id: number, data: Partial<{ name: string; description: string }>) {
  return db('product_category').where({ id }).update(data).returning('*');
}

export async function deleteCategory(id: number) {
  return db('product_category').where({ id }).del();
}
