import db from '../db';

export interface Product {
  id?: number;
  name: string;
  brand?: string;
  open_food_facts_id?: string;
  barcode?: string;
  image_url?: string;
  category?: number;
  nutrition_info?: any;
  supermarket_location_id?: number;
  created_at?: string;
  created_by_user_id?: number;
  updated_at?: string;
  updated_by_user_id?: number;
}

export async function createProduct(product: Product): Promise<Product> {
  const [id] = await db('product').insert(product);
  return { ...product, id };
}

export async function getAllProducts(): Promise<Product[]> {
  return db('product').select('*');
}

export async function getProductById(id: number): Promise<Product | undefined> {
  return db('product').where({ id }).first();
}

export async function updateProduct(id: number, updates: Partial<Product>): Promise<number> {
  return db('product').where({ id }).update(updates);
}

export async function deleteProduct(id: number): Promise<number> {
  return db('product').where({ id }).del();
}
