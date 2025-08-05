import db from '../db';

export interface GroceryItem {
  id?: number;
  product_id?: number;
  container_id?: number;
  added_by_user_id?: number;
  name: string;
  unit?: string;
  quantity?: number;
  rest_quantity?: number;
  expiration_date?: string;
  buy_date?: string;
  is_opened?: boolean;
  opened_date?: string;
  photo_url?: string;
  notes?: string;
  created_at?: string;
  created_by_user_id?: number;
  updated_at?: string;
  updated_by_user_id?: number;
}

export async function createGroceryItem(item: GroceryItem): Promise<GroceryItem> {
  const [id] = await db('grocery_item').insert(item);
  return { ...item, id };
}

export async function getAllGroceryItems(): Promise<GroceryItem[]> {
  return db('grocery_item').select('*');
}

export async function getGroceryItemById(id: number): Promise<GroceryItem | undefined> {
  return db('grocery_item').where({ id }).first();
}

export async function updateGroceryItem(id: number, updates: Partial<GroceryItem>): Promise<number> {
  return db('grocery_item').where({ id }).update(updates);
}

export async function deleteGroceryItem(id: number): Promise<number> {
  return db('grocery_item').where({ id }).del();
}
