import { useRxDB } from 'rxdb-hooks';
import { ProductDocType } from '../../types/dbCollections';
import { lookupOpenFoodFactsBarcode } from '../../external/openFoodFacts';

export function useProductSearchByBarcode() {
  const db = useRxDB();

  async function searchProduct(barcode: string): Promise<ProductDocType | any | null> {
    if (!db) throw new Error('RxDB not initialized');
    // Search in local DB
    const found = await db.collections.product.findOne({ selector: { barcode } }).exec();
    if (found) return found.toJSON();
    // If not found, search Open Food Facts
    try {
      const offProduct = await lookupOpenFoodFactsBarcode(barcode);
      return offProduct;
    } catch (e) {
      return null;
    }
  }

  return { searchProduct };
}
