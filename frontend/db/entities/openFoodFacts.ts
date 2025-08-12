// Open Food Facts integration utilities for Grocodex (local-first)

import { Product, GroceryItem } from '../../types/entities';
import { OpenFoodFactsProduct } from '../../types/openFoodFacts';
import { addOrUpdateProduct, getProductsByBarcode } from './product';
import { addOrUpdateGroceryItem } from './groceryItem';


const OFF_API_BASE = 'https://world.openfoodfacts.org';


/**
 * Searches for products in the Open Food Facts database by product name.
 *
 * @param name - The name or search term to query for products.
 * @returns A promise that resolves to an array of `OpenFoodFactsProduct` objects matching the search term.
 * @throws An object with `{ error: 'ERR_OPENFOODFACTS_UNAVAILABLE' }` if the Open Food Facts API is unavailable.
 * @throws An object with `{ error: 'ERR_NOT_FOUND' }` if no products are found in the response.
 */
export async function searchOpenFoodFacts(name: string): Promise<OpenFoodFactsProduct[]> {
  const url = `${OFF_API_BASE}/cgi/search.pl`;
  const params = new URLSearchParams({
    search_terms: name,
    search_simple: '1',
    action: 'process',
    json: '1',
    page_size: '10',
  });
  const res = await fetch(`${url}?${params}`);
  if (!res.ok) throw { error: 'ERR_OPENFOODFACTS_UNAVAILABLE' };
  const data = await res.json();
  if (data.products && Array.isArray(data.products)) {
    return data.products;
  }
  throw { error: 'ERR_NOT_FOUND' };
}

/**
 * Looks up a product from the Open Food Facts API using the provided barcode.
 *
 * @param barcode - The barcode of the product to look up.
 * @returns A promise that resolves to the `OpenFoodFactsProduct` if found.
 * @throws An error object with `{ error: 'ERR_OPENFOODFACTS_UNAVAILABLE' }` if the API is unavailable.
 * @throws An error object with `{ error: 'ERR_NOT_FOUND' }` if the product is not found.
 */
export async function lookupOpenFoodFactsBarcode(barcode: string): Promise<OpenFoodFactsProduct> {
  const url = `${OFF_API_BASE}/api/v0/product/${barcode}.json`;
  const res = await fetch(url);
  if (!res.ok) throw { error: 'ERR_OPENFOODFACTS_UNAVAILABLE' };
  const data = await res.json();
  if (data.status === 1 && data.product) {
    return data.product;
  }
  throw { error: 'ERR_NOT_FOUND' };
}

/**
 * Creates a new product and grocery item from an Open Food Facts product object.
 * 
 * This function checks if a product with the given barcode already exists.
 * If it exists, it uses the existing product; otherwise, it creates a new product entry.
 * Then, it creates a grocery item associated with the product.
 * 
 * @param offProduct - The Open Food Facts product object containing product details.
 * @param container_id - (Optional) The ID of the container to associate with the grocery item.
 * @param quantity - (Optional) The quantity of the grocery item. Defaults to 1.
 * @param expiration_date - (Optional) The expiration date of the grocery item.
 * @returns A promise that resolves to an object containing the created or found product and the new grocery item.
 */
export async function createProductAndGroceryItemFromOFF(
  offProduct: OpenFoodFactsProduct,
  container_id?: string,
  quantity: number = 1,
  expiration_date?: string
): Promise<{ product: Product; groceryItem: GroceryItem }> {
  // Check if product already exists by barcode
  let product: Product | undefined = undefined;
  const existing = await getProductsByBarcode(offProduct.code);
  if (existing.length > 0) {
    product = existing[0];
  } else {
    product = {
      id: crypto.randomUUID(),
      name: offProduct.product_name || 'Unknown',
      brand: offProduct.brands,
      open_food_facts_id: offProduct.code,
      barcode: offProduct.code,
      image_url: offProduct.image_url,
      category: offProduct.categories_tags?.[0],
      nutrition_info: offProduct.nutriments,
      created_at: new Date().toISOString(),
    };
    await addOrUpdateProduct(product);
  }
  // Create grocery item
  const groceryItem: GroceryItem = {
    id: crypto.randomUUID(),
    product_id: product.id,
    name: product.name,
    container_id,
    quantity,
    expiration_date,
    created_at: new Date().toISOString(),
  };
  await addOrUpdateGroceryItem(groceryItem);
  return { product, groceryItem };
}
