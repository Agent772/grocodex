// Error keys used for i18n-compatible error handling in Grocodex CRUD utilities
// Update this file whenever you add or change error keys in the codebase

export const ERROR_KEYS = [
  // Store Location errors
  'ERR_STORE_LOCATION_CREATE',
  'ERR_STORE_LOCATION_LIST',
  'ERR_STORE_LOCATION_NOT_FOUND',
  'ERR_STORE_LOCATION_UPDATE',
  'ERR_STORE_LOCATION_DELETE',

  // Store Location validation errors
  'ERR_STORE_LOCATION_PRODUCT_ID_REQUIRED',
  'ERR_STORE_LOCATION_SUPERMARKET_ID_REQUIRED',
  'ERR_STORE_LOCATION_VALIDATION',

  // Category validation errors
  'ERR_CATEGORY_NAME_REQUIRED',
  'ERR_CATEGORY_VALIDATION',

  // Container validation errors
  'ERR_CONTAINER_NAME_REQUIRED',
  'ERR_CONTAINER_VALIDATION',

  // Grocery Item validation errors
  'ERR_GROCERY_ITEM_NAME_REQUIRED',
  'ERR_GROCERY_ITEM_VALIDATION',

  // Product validation errors
  'ERR_PRODUCT_NAME_REQUIRED',
  'ERR_PRODUCT_VALIDATION',

  // Store validation errors
  'ERR_STORE_NAME_REQUIRED',
  'ERR_STORE_VALIDATION',
  // Store errors
  'ERR_STORE_CREATE',
  'ERR_STORE_LIST',
  'ERR_STORE_NOT_FOUND',
  'ERR_STORE_UPDATE',
  'ERR_STORE_DELETE',
  // Grocery Item errors
  'ERR_GROCERY_ITEM_NOT_FOUND',
  'ERR_GROCERY_ITEM_CREATE_FAILED',
  'ERR_GROCERY_ITEM_DELETE_FAILED',

  // Product errors
  'ERR_PRODUCT_NOT_FOUND',
  'ERR_PRODUCT_CREATE_FAILED',
  'ERR_PRODUCT_DELETE_FAILED',

  // Shopping List errors
  'ERR_SHOPPING_LIST_CREATE_FAILED',
  'ERR_SHOPPING_LIST_NOT_FOUND',
  'ERR_SHOPPING_LIST_DELETE_FAILED',
  // Shopping List Item errors
  'ERR_SHOPPING_LIST_ITEM_BATCH_ADD_FAILED',

  // Open Food Facts errors
  'ERR_OPENFOODFACTS_UNAVAILABLE',
  'ERR_NOT_FOUND',

  // Category errors
  'ERR_CATEGORY_CREATE',
  'ERR_CATEGORY_NOT_FOUND',
  'ERR_CATEGORY_UPDATE',
  'ERR_CATEGORY_DELETE',

  // Container errors
  'ERR_CONTAINER_CREATE_FAILED',
  'ERR_CONTAINER_NOT_FOUND',
  'ERR_CONTAINER_UPDATE_FAILED',
  'ERR_CONTAINER_DELETE_FAILED',

  // Add more error keys for other entities as you migrate them
];

// Usage pattern:
// import { ERROR_KEYS } from '../types/errorKeys';
// if (error.error && ERROR_KEYS.includes(error.error)) {
//   // Use i18n to translate error.error
// }
