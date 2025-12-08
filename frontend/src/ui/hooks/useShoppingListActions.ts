import { useRxDB } from 'rxdb-hooks';
import { ShoppingListDocType } from '../../types/dbCollections';

export function useShoppingListActions() {
  const db = useRxDB();

  async function addShoppingList(name: string) {
    if (!db) throw new Error('RxDB not initialized');
    const newListId = crypto.randomUUID();
    const newList: ShoppingListDocType = {
      id: newListId,
      name,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    await db.collections.shopping_list.insert(newList);
    return newListId;
  }

  async function updateShoppingList(id: string, updatedFields: Partial<ShoppingListDocType>) {
    if (!db) throw new Error('RxDB not initialized');
    const doc = await db.collections.shopping_list.findOne(id).exec();
    if (!doc) throw new Error('Shopping list not found');
    await doc.patch(updatedFields);
  }

  async function deleteShoppingList(id: string) {
    if (!db) throw new Error('RxDB not initialized');
    
    // Delete all items in this list first
    const items = await db.collections.shopping_list_item
      .find({ selector: { shopping_list_id: id } })
      .exec();
    
    for (const item of items) {
      await item.remove();
    }
    
    // Delete the list itself
    const doc = await db.collections.shopping_list.findOne(id).exec();
    if (!doc) throw new Error('Shopping list not found');
    await doc.remove();
  }

  return { addShoppingList, updateShoppingList, deleteShoppingList };
}
