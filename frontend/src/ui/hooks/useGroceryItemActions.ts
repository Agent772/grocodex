import { useRxDB } from 'rxdb-hooks';
import { GroceryItemDocType } from '../../types/dbCollections';
import { useProductActions } from './useProductActions';

export function useGroceryItemActions() {
  const db = useRxDB();
  const { syncProductPreferredContainer } = useProductActions();

  async function addGroceryItem(item: GroceryItemDocType) {
    if (!db) throw new Error('RxDB not initialized');
    await db.collections.grocery_item.insert(item);
    
    // Async sync preferred container (fire-and-forget)
    syncProductPreferredContainer(item.product_id);
  }

  async function updateGroceryItem(id: string, updatedFields: Partial<GroceryItemDocType>) {
    if (!db) throw new Error('RxDB not initialized');
    const doc = await db.collections.grocery_item.findOne(id).exec();
    if (!doc) throw new Error('Grocery item not found');
    
    const oldItem = doc.toJSON();
    await doc.patch(updatedFields);
    
    // If container changed, sync preferred container (fire-and-forget)
    if (updatedFields.container_id && updatedFields.container_id !== oldItem.container_id) {
      syncProductPreferredContainer(oldItem.product_id);
    }
  }

  // Add more actions as needed (update, delete, etc.)

  return { addGroceryItem, updateGroceryItem };
}
