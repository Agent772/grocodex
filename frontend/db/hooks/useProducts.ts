import { useCallback, useEffect, useState } from 'react';
import {
  getAllProducts,
  getProductById,
  addOrUpdateProduct,
  deleteProduct,
  getProductsByBarcode,
  getProductsByName,
  deleteProductCascade,
} from '../entities/product';
import { Product } from '../../types/entities';


/**
 * React hook for managing and interacting with the products stored in IndexedDB.
 *
 * Provides state and CRUD operations for products, including:
 * - Fetching all products
 * - Adding or updating a product
 * - Deleting a product (with optional cascade delete)
 * - Fetching products by ID, barcode, or name
 *
 * Handles loading and error states automatically.
 *
 * @returns An object containing:
 * - `products`: The current list of products.
 * - `loading`: Whether a fetch or mutation is in progress.
 * - `error`: The latest error message, if any.
 * - `refresh`: Function to manually refresh the product list.
 * - `addOrUpdate`: Function to add or update a product.
 * - `remove`: Function to delete a product by ID.
 * - `removeCascade`: Function to cascade delete a product and its associated grocery items.
 * - `getById`: Function to fetch a product by its ID.
 * - `getByBarcode`: Function to fetch products by barcode.
 * - `getByName`: Function to fetch products by name.
 */
export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetches all products from IndexedDB and updates state.
   */
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllProducts();
      setProducts(data);
    } catch (e: any) {
      setError(e?.error || 'ERR_PRODUCT_FETCH_FAILED');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  /**
   * Adds or updates a product, then refreshes the product list.
   */
  const addOrUpdate = useCallback(async (product: Product) => {
    setError(null);
    try {
      await addOrUpdateProduct(product);
      await fetchProducts();
    } catch (e: any) {
      setError(e?.error || 'ERR_PRODUCT_CREATE_FAILED');
    }
  }, [fetchProducts]);

  /**
   * Deletes a product by ID, then refreshes the product list.
   */
  const remove = useCallback(async (id: string) => {
    setError(null);
    try {
      await deleteProduct(id);
      await fetchProducts();
    } catch (e: any) {
      setError(e?.error || 'ERR_PRODUCT_DELETE_FAILED');
    }
  }, [fetchProducts]);

  /**
   * Cascade deletes a product and all associated grocery items, then refreshes the product list.
   */
  const removeCascade = useCallback(async (id: string) => {
    setError(null);
    try {
      await deleteProductCascade(id);
      await fetchProducts();
    } catch (e: any) {
      setError(e?.error || 'ERR_PRODUCT_DELETE_FAILED');
    }
  }, [fetchProducts]);

  /**
   * Gets a product by its ID.
   */
  const getById = useCallback(async (id: string) => {
    setError(null);
    try {
      return await getProductById(id);
    } catch (e: any) {
      setError(e?.error || 'ERR_PRODUCT_NOT_FOUND');
      return undefined;
    }
  }, []);

  /**
   * Gets products by barcode.
   */
  const getByBarcode = useCallback(async (barcode: string) => {
    setError(null);
    try {
      return await getProductsByBarcode(barcode);
    } catch (e: any) {
      setError(e?.error || 'ERR_PRODUCT_FETCH_FAILED');
      return [];
    }
  }, []);

  /**
   * Gets products by name.
   */
  const getByName = useCallback(async (name: string) => {
    setError(null);
    try {
      return await getProductsByName(name);
    } catch (e: any) {
      setError(e?.error || 'ERR_PRODUCT_FETCH_FAILED');
      return [];
    }
  }, []);

  return {
    products,
    loading,
    error,
    refresh: fetchProducts,
    addOrUpdate,
    remove,
    removeCascade,
    getById,
    getByBarcode,
    getByName,
  };
}
