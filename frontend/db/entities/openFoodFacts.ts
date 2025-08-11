// Open Food Facts integration utilities for Grocodex (local-first)
// - Search Open Food Facts by product name
// - Lookup product by barcode
// - Create Product and GroceryItem from Open Food Facts result
// - All data is stored locally (IndexedDB)

import { Product, GroceryItem } from '../../types/entities';
import { OpenFoodFactsProduct } from '../../types/openFoodFacts';
import { addOrUpdateProduct, getProductsByBarcode } from './product';
import { addOrUpdateGroceryItem } from './groceryItem';

// Use zxing-js or QuaggaJS for barcode scanning in the UI (not here)

// --- Open Food Facts API helpers ---
const OFF_API_BASE = 'https://world.openfoodfacts.org';


// Search Open Food Facts by product name
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

// Lookup Open Food Facts by barcode
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

// Create Product and GroceryItem from Open Food Facts product
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
