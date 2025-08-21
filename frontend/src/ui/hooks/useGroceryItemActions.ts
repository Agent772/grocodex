import { useRxDB } from '../../db/RxDBProvider';
import { GroceryItemDocType } from '../../types/dbCollections';

export function useGroceryItemActions() {
  const db = useRxDB();

  async function addGroceryItem(item: GroceryItemDocType) {
    if (!db) throw new Error('RxDB not initialized');
    await db.collections.grocery_item.insert(item);
  }

  // Add more actions as needed (update, delete, etc.)

  return { addGroceryItem };
}
