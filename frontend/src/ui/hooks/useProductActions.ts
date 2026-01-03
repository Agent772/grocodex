import { useRxDB } from 'rxdb-hooks';
import { ProductDocType } from '../../types/dbCollections';
import { queuePreferredContainerSync } from '../../db/logic/containerPreferenceLogic';

export function useProductActions() {
  const db = useRxDB();

  async function findProductByNameUnitQuantityBarcode(name: string, unit: string, quantity: number, barcode?: string): Promise<ProductDocType | null> {
    if (!db) throw new Error('RxDB not initialized');
    const selector: any = { name, unit, quantity };
    if (barcode) selector.barcode = barcode;
    const found = await db.collections.product.findOne({ selector }).exec();
    return found ? found.toJSON() : null;
  }

  async function addProduct(product: ProductDocType): Promise<ProductDocType> {
    if (!db) throw new Error('RxDB not initialized');
    const doc = await db.collections.product.insert(product);
    return doc as ProductDocType;
  }

  /**
   * Asynchronously syncs the preferred container for a product.
   * Uses debounced queue to prevent duplicate calculations.
   * Fire-and-forget - does not block caller.
   */
  function syncProductPreferredContainer(product_id: string): void {
    if (!db) {
      console.error('Cannot sync preferred container: RxDB not initialized');
      return;
    }
    try {
      queuePreferredContainerSync(db, product_id);
    } catch (error) {
      console.error(`Failed to queue preferred container sync for product ${product_id}:`, error);
    }
  }

  return { findProductByNameUnitQuantityBarcode, addProduct, syncProductPreferredContainer };
}
