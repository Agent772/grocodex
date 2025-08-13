// Shared entity interfaces for Grocodex (mirrors backend schema.sql)

export interface User {
  id: string;
  username: string;
  password_hash: string;
  created_at: string;
  updated_at?: string;
  avatar?: string; // base64 string or blob URL
  isAdmin?: boolean; // true if user is an admin
  theme?: 'light' | 'dark'; // user's theme preference
}

export interface Container {
  id: string;
  name: string;
  parent_container_id?: string;
  description?: string;
  photo_url?: string;
  ui_color?: string;
  created_at?: string;
  created_by_user_id?: string;
  updated_at?: string;
  updated_by_user_id?: string;
}

export interface Supermarket {
  id: string;
  name: string;
  location?: string;
  created_at?: string;
  created_by_user_id?: string;
  updated_at?: string;
  updated_by_user_id?: string;
}

export interface SupermarketProduct {
  id: string;
  product_id: string;
  supermarket_id: string;
  location?: string;
  created_at?: string;
  created_by_user_id?: string;
  updated_at?: string;
  updated_by_user_id?: string;
}

export interface ProductCategory {
  id: string;
  name: string;
  description?: string;
  created_at?: string;
  created_by_user_id?: string;
  updated_at?: string;
  updated_by_user_id?: string;
}

export interface Product {
  id: string;
  name: string;
  brand?: string;
  open_food_facts_id?: string;
  barcode?: string;
  image_url?: string;
  category?: string;
  nutrition_info?: any;
  supermarket_location_id?: string;
  created_at?: string;
  created_by_user_id?: string;
  updated_at?: string;
  updated_by_user_id?: string;
}

export interface GroceryItem {
  id: string;
  product_id?: string;
  container_id?: string;
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
  created_by_user_id?: string;
  updated_at?: string;
  updated_by_user_id?: string;
}

export interface ShoppingList {
  id: string;
  name: string;
  created_at?: string;
  created_by_user_id?: string;
  updated_at?: string;
  updated_by_user_id?: string;
}

export interface ShoppingListItem {
  id: string;
  shopping_list_id: string;
  product_id?: string;
  quantity?: number;
  unit?: string;
  comment?: string;
  image_url?: string;
  completed?: boolean;
  created_at?: string;
  created_by_user_id?: string;
  updated_at?: string;
  updated_by_user_id?: string;
}
