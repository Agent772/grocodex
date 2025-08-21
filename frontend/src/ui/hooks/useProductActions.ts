import { useRxDB } from '../../db/RxDBProvider';
import { ProductDocType } from '../../types/dbCollections';

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

  return { findProductByNameUnitQuantityBarcode, addProduct };
}
