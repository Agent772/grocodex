import { useRxDB } from '../../db/RxDBProvider';
import { ProductGroupDocType } from '../../types/dbCollections';

export function useProductGroupActions() {
  const db = useRxDB();

  async function findProductGroupByName(name: string): Promise<ProductGroupDocType | null> {
    if (!db) throw new Error('RxDB not initialized');
    const found = await db.collections.product_group.findOne({ selector: { name } }).exec();
    return found ? found.toJSON() : null;
  }

  async function addProductGroup(group: ProductGroupDocType): Promise<ProductGroupDocType> {
    if (!db) throw new Error('RxDB not initialized');
    const doc = await db.collections.product_group.insert(group);
    return doc as ProductGroupDocType;
  }

  return { findProductGroupByName, addProductGroup };
}
