// Open Food Facts integration utilities for Grocodex (local-first)

import { OpenFoodFactsProduct } from '../types/openFoodFacts';
import i18n from '../i18n';
import { ProductDocType, GroceryItemDocType } from '../types/dbCollections';


const OFF_API_BASE = 'https://world.openfoodfacts.net';
const OFF_USER_AGENT = 'Grocodex/0.4 (akex.urban@gmail.com)';


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
  const res = await fetch(`${url}?${params}`, {
    headers: {
      'User-Agent': OFF_USER_AGENT,
    },
  });
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
 * @returns A promise that resolves to the ProductDocType if found.
 * @throws An error object with `{ error: 'ERR_OPENFOODFACTS_UNAVAILABLE' }` if the API is unavailable.
 * @throws An error object with `{ error: 'ERR_NOT_FOUND' }` if the product is not found.
 */
export async function lookupOpenFoodFactsBarcode(barcode: string): Promise<ProductDocType> {
  // Detect language code from i18n
  const lang = i18n.language || 'de';
  // Detect country code (try from browser, fallback to 'at')
  let country = 'at';
  if (typeof navigator !== 'undefined' && navigator.language) {
    const parts = navigator.language.split('-');
    if (parts.length > 1) country = parts[1].toLowerCase();
    else country = parts[0].toLowerCase();
  }
  // Dynamic product_name field
  const productNameField = `product_name_${lang}`;
  const fields = [
    'id',
    productNameField,
    'product_name',
    'brands',
    'product_quantity',
    'product_quantity_unit',
    'barcode',
    'image_url',
    'created_at',
    'updated_at',
  ].join(',');
  const url = `${OFF_API_BASE}/api/v3/product/${barcode}.json?cc=${country}&lc=${lang}&fields=${fields}`;
  const res = await fetch(url, {
    headers: {
      'User-Agent': OFF_USER_AGENT,
    },
  });
  if (!res.ok) throw { error: 'ERR_OPENFOODFACTS_UNAVAILABLE' };
  const data = await res.json();
  if (data.product && typeof data.product === 'object') {
    // Normalize to ProductDocType
    return {
      id: data.product.id || crypto.randomUUID(),
      product_group_id: '', // Not available from OFF
      name: data.product[productNameField] || data.product.product_name || '',
      brand: data.product.brands || '',
      barcode: barcode,
      unit: data.product.product_quantity_unit || '',
      quantity: Number(data.product.product_quantity) || 1,
      image_url: data.product.image_url,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }
  throw { error: 'ERR_NOT_FOUND' };
}