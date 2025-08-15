// Search utility for Grocodex products and product groups
import { Product } from '../../types/entities';
import { getAllProducts } from '../entities/product';
import { getAllProductGroups } from '../entities/productGroup';

export async function searchProductsAndGroups(search: string): Promise<Array<{ type: 'product' | 'group'; item: any }>> {
  const lowerSearch = search.trim().toLowerCase();
  const products: Product[] = await getAllProducts();
  const groups = await getAllProductGroups();
  const results: Array<{ type: 'product' | 'group'; item: any }> = [];

  // Search products
  for (const product of products) {
    if (
      (product.name && product.name.toLowerCase().includes(lowerSearch)) ||
      (product.brand && product.brand.toLowerCase().includes(lowerSearch))
    ) {
      results.push({ type: 'product', item: product });
    }
  }

  // Search product groups
  for (const group of groups) {
    if (group.name && group.name.toLowerCase().includes(lowerSearch)) {
      results.push({ type: 'group', item: group });
    }
  }

  return results;
}
