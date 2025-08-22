import { useRxDB } from '../../db/RxDBProvider';
import { GroceryItemDocType } from '../../types/dbCollections';

export function useGroceryItemActions() {
  const db = useRxDB();

  async function addGroceryItem(item: GroceryItemDocType) {
    if (!db) throw new Error('RxDB not initialized');
    await db.collections.grocery_item.insert(item);
  }

  async function updateGroceryItem(id: string, updatedFields: Partial<GroceryItemDocType>) {
    if (!db) throw new Error('RxDB not initialized');
    const doc = await db.collections.grocery_item.findOne(id).exec();
    if (!doc) throw new Error('Grocery item not found');
    await doc.patch(updatedFields);
  }

  // Add more actions as needed (update, delete, etc.)

  return { addGroceryItem, updateGroceryItem };
}
