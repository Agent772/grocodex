// Types for Open Food Facts API integration
// Shared for modular, maintainable code

export interface OpenFoodFactsProduct {
  code: string;
  product_name: string;
  brands?: string;
  image_url?: string;
  categories_tags?: string[];
  nutriments?: any;
  [key: string]: any;
}
