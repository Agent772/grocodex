import { useCallback, useState } from 'react';
import {
  searchOpenFoodFacts,
  lookupOpenFoodFactsBarcode,
  createProductAndGroceryItemFromOFF,
} from '../entities/openFoodFacts';
import { OpenFoodFactsProduct } from '../../types/openFoodFacts';
import { Product, GroceryItem } from '../../types/entities';

/**
 * Custom React hook to search for products using the OpenFoodFacts API.
 *
 * @returns An object containing:
 * - `results`: An array of `OpenFoodFactsProduct` representing the search results.
 * - `loading`: A boolean indicating if the search is in progress.
 * - `error`: A string or `null` representing any error that occurred during the search.
 * - `search`: A function that accepts a product name (`string`) and performs the search.
 *
 * @example
 * const { results, loading, error, search } = useOpenFoodFactsSearch();
 * useEffect(() => {
 *   search('apple');
 * }, []);
 */
export function useOpenFoodFactsSearch() {
  const [results, setResults] = useState<OpenFoodFactsProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(async (name: string) => {
    setLoading(true);
    setError(null);
    try {
      const products = await searchOpenFoodFacts(name);
      setResults(products);
    } catch (e: any) {
      setError(e?.error || 'ERR_OPENFOODFACTS_UNAVAILABLE');
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  return { results, loading, error, search };
}

/**
 * React hook to fetch product information from OpenFoodFacts using a barcode.
 *
 * @returns An object containing:
 * - `product`: The fetched `OpenFoodFactsProduct` or `null` if not found.
 * - `loading`: Boolean indicating if the lookup is in progress.
 * - `error`: Error message string or `null` if no error occurred.
 * - `lookup`: Async function to trigger a lookup by barcode.
 *
 * @example
 * const { product, loading, error, lookup } = useOpenFoodFactsBarcode();
 * useEffect(() => {
 *   lookup('1234567890123');
 * }, []);
 */
export function useOpenFoodFactsBarcode() {
  const [product, setProduct] = useState<OpenFoodFactsProduct | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const lookup = useCallback(async (barcode: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await lookupOpenFoodFactsBarcode(barcode);
      setProduct(result);
    } catch (e: any) {
      setError(e?.error || 'ERR_OPENFOODFACTS_UNAVAILABLE');
      setProduct(null);
    } finally {
      setLoading(false);
    }
  }, []);

  return { product, loading, error, lookup };
}

/**
 * Custom React hook to create a product and grocery item from an Open Food Facts product.
 *
 * This hook manages the asynchronous creation process, including loading and error states.
 * It exposes the result, loading, and error states, as well as a `create` function to trigger the operation.
 *
 * @returns An object containing:
 * - `result`: The created product and grocery item, or `null` if not created.
 * - `loading`: Boolean indicating if the creation is in progress.
 * - `error`: Error message string if creation failed, or `null` if no error.
 * - `create`: Function to initiate the creation process.
 *
 * @example
 * const { result, loading, error, create } = useCreateProductAndGroceryItemFromOFF();
 * // Call create(offProduct, containerId, quantity, expirationDate) to create items.
 */
export function useCreateProductAndGroceryItemFromOFF() {
  const [result, setResult] = useState<{ product: Product; groceryItem: GroceryItem } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = useCallback(
    async (
      offProduct: OpenFoodFactsProduct,
      container_id?: string,
      quantity: number = 1,
      expiration_date?: string
    ) => {
      setLoading(true);
      setError(null);
      try {
        const res = await createProductAndGroceryItemFromOFF(
          offProduct,
          container_id,
          quantity,
          expiration_date
        );
        setResult(res);
      } catch (e: any) {
        setError(e?.error || 'ERR_OPENFOODFACTS_CREATE_FAILED');
        setResult(null);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { result, loading, error, create };
}
