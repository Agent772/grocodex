import { useRxDB } from 'rxdb-hooks';
import { ProductDocType } from '../../types/dbCollections';

export function useProductSearchByName() {
  const db = useRxDB();

  async function searchProducts(name: string): Promise<ProductDocType[]> {
    if (!db) throw new Error('RxDB not initialized');
    try {
      const results = await db.collections.product.find({
        selector: {
          name: { $regex: name, $options: 'i' }
        }
      }).exec();
      return results.map(doc => doc.toJSON());
    } catch (err) {
      console.error('[searchProducts] Error during search:', err);
      return [];
    }
  }

  return { searchProducts };
}
