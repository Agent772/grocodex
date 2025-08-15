// CRUD utilities for products in IndexedDB
import { getDB } from '../index';
import { Product } from '../../types/entities';
import { deleteGroceryItemsByProductId } from './groceryItem';

/**
 * Retrieves all products from the database.
 *
 * @returns {Promise<Product[]>} A promise that resolves to an array of all products.
 */
export async function getAllProducts(): Promise<Product[]> {
  const db = await getDB();
  return db.getAll('products');
}

/**
 * Retrieves a product by its unique identifier from the database.
 *
 * @param id - The unique identifier of the product to retrieve.
 * @returns A promise that resolves to the `Product` if found, or `undefined` if not found.
 * @throws An object with `{ error: 'ERR_PRODUCT_NOT_FOUND' }` if the product does not exist.
 */
export async function getProductById(id: string): Promise<Product | undefined> {
  const db = await getDB();
  const product = await db.get('products', id);
  if (!product) {
    throw { error: 'ERR_PRODUCT_NOT_FOUND' };
  }
  return product;
}

/**
 * Adds a new product or updates an existing product in the 'products' store.
 *
 * @param product - The product object to add or update in the database.
 * @returns A promise that resolves when the operation is complete.
 * @throws An error object with `{ error: 'ERR_PRODUCT_CREATE_FAILED' }` if the operation fails.
 */
export async function addOrUpdateProduct(product: Product): Promise<void> {
  const db = await getDB();
  try {
    await db.put('products', product);
  } catch (e) {
    throw { error: 'ERR_PRODUCT_CREATE_FAILED' };
  }
}

/**
 * Deletes a product from the database by its ID.
 *
 * @param id - The unique identifier of the product to delete.
 * @returns A promise that resolves when the product is successfully deleted.
 * @throws { error: 'ERR_PRODUCT_NOT_FOUND' } If the product with the given ID does not exist.
 * @throws { error: 'ERR_PRODUCT_DELETE_FAILED' } If the deletion operation fails.
 */
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

/**
 * Retrieves all products from the database that match the specified barcode.
 *
 * @param barcode - The barcode to search for in the products index.
 * @returns A promise that resolves to an array of `Product` objects matching the given barcode.
 */
export async function getProductsByBarcode(barcode: string): Promise<Product[]> {
  const db = await getDB();
  return db.getAllFromIndex('products', 'by-barcode', barcode);
}

/**
 * Retrieves all products from the database that match the specified name.
 *
 * @param name - The name of the products to search for.
 * @returns A promise that resolves to an array of `Product` objects matching the given name.
 */
export async function getProductsByName(name: string): Promise<Product[]> {
  const db = await getDB();
  return db.getAllFromIndex('products', 'by-name', name);
}

/**
 * Retrieves all products from the database that match the specified unit.
 */
export async function getProductsByUnit(unit: string): Promise<Product[]> {
  const db = await getDB();
  return db.getAllFromIndex('products', 'by-unit', unit);
}

/**
 * Retrieves all products from the database that match the specified quantity.
 */
export async function getProductsByQuantity(quantity: number): Promise<Product[]> {
  const db = await getDB();
  return db.getAllFromIndex('products', 'by-quantity', quantity.toString());
}

/**
 * Retrieves all products from the database that match the specified photo_url.
 */
export async function getProductsByPhotoUrl(photo_url: string): Promise<Product[]> {
  const db = await getDB();
  return db.getAllFromIndex('products', 'by-photo_url', photo_url);
}

/**
 * Deletes a product and all associated grocery items in a cascading manner.
 *
 * This function first deletes all grocery items linked to the specified product ID,
 * and then deletes the product itself.
 *
 * @param id - The unique identifier of the product to delete.
 * @returns A promise that resolves when the product and its related grocery items have been deleted.
 */
export async function deleteProductCascade(id: string): Promise<void> {
  await deleteGroceryItemsByProductId(id);
  await deleteProduct(id);
}
