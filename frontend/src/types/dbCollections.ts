// This file contains TypeScript interfaces for the Grocodex collections.
export interface ContainerDocType {
  id: string;
  name: string;
  parent_container_id?: string | null;
  description?: string;
  photo_url?: string;
  ui_color?: string;
  created_at?: string;
  updated_at?: string;
}

export interface SupermarketDocType {
  id: string;
  name: string;
  address?: string;
  created_at?: string;
  updated_at?: string;
}

export interface SupermarketProductDocType {
  id: string;
  product_id: string;
  supermarket_id: string;
  in_store_location?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ProductGroupDocType {
  id: string;
  name: string;
  brand?: string;
}

export interface ProductDocType {
  id: string;
  product_group_id: string;
  name: string;
  brand: string;
  barcode?: string;
  unit: string;
  quantity: number;
  image_url?: string;
  supermarket_location_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface GroceryItemDocType {
  id: string;
  product_id: string;
  container_id: string;
  rest_quantity?: number;
  expiration_date?: string;
  buy_date?: string;
  is_opened?: boolean;
  opened_date?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ShoppingListDocType {
  id: string;
  name: string;
  created_at?: string;
  updated_at?: string;
}

export interface ShoppingListItemDocType {
  id: string;
  shopping_list_id: string;
  product_id?: string;
  name?: string;
  unit?: string;
  quantity: number;
  comment?: string;
  image_url?: string;
  created_at?: string;
  updated_at?: string;
}


export type { GrocodexCollections } from './rxdb.d';
