import { useRxDB } from 'rxdb-hooks';
import { GroceryItemDocType } from '../../types/dbCollections';

export async function findGroceryItemByProductId(db: any, productId: string): Promise<GroceryItemDocType | null> {
  if (!db) return null;
  const found = await db.collections.grocery_item.findOne({ selector: { product_id: productId } }).exec();
  return found ? found.toJSON() : null;
}
