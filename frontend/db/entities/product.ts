// CRUD utilities for products in IndexedDB
import { getDB } from '../index';
import { Product } from '../../types/entities';
import { deleteGroceryItemsByProductId } from './groceryItem';

export async function getAllProducts(): Promise<Product[]> {
  const db = await getDB();
  return db.getAll('products');
}

export async function getProductById(id: string): Promise<Product | undefined> {
  const db = await getDB();
  const product = await db.get('products', id);
  if (!product) {
    throw { error: 'ERR_PRODUCT_NOT_FOUND' };
  }
  return product;
}

export async function addOrUpdateProduct(product: Product): Promise<void> {
  const db = await getDB();
  try {
    await db.put('products', product);
  } catch (e) {
    throw { error: 'ERR_PRODUCT_CREATE_FAILED' };
  }
}

export async function deleteProduct(id: string): Promise<void> {
  const db = await getDB();
  const product = await db.get('products', id);
  if (!product) {
    throw { error: 'ERR_PRODUCT_NOT_FOUND' };
  }
  try {
    await db.delete('products', id);
  } catch (e) {
    throw { error: 'ERR_PRODUCT_DELETE_FAILED' };
  }
}

export async function getProductsByBarcode(barcode: string): Promise<Product[]> {
  const db = await getDB();
  return db.getAllFromIndex('products', 'by-barcode', barcode);
}

export async function getProductsByName(name: string): Promise<Product[]> {
  const db = await getDB();
  return db.getAllFromIndex('products', 'by-name', name);
}

// Cascading delete: delete all grocery items for a product, then the product
export async function deleteProductCascade(id: string): Promise<void> {
  await deleteGroceryItemsByProductId(id);
  await deleteProduct(id);
}
