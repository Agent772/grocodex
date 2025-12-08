import { useRxDB } from 'rxdb-hooks';
import { ShoppingListItemDocType } from '../../types/dbCollections';

export function useShoppingListItemActions() {
  const db = useRxDB();

  async function addShoppingListItem(item: Omit<ShoppingListItemDocType, 'id' | 'created_at' | 'updated_at' | 'completed' | 'count'> & { count?: number }) {
    if (!db) throw new Error('RxDB not initialized');
    const newItem: ShoppingListItemDocType = {
      ...item,
      id: crypto.randomUUID(),
      count: item.count || 1,
      completed: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    await db.collections.shopping_list_item.insert(newItem);
    return newItem;
  }

  async function updateShoppingListItem(id: string, updatedFields: Partial<ShoppingListItemDocType>) {
    if (!db) throw new Error('RxDB not initialized');
    const doc = await db.collections.shopping_list_item.findOne(id).exec();
    if (!doc) throw new Error('Shopping list item not found');
    await doc.patch(updatedFields);
  }

  async function toggleShoppingListItemCompleted(id: string) {
    if (!db) throw new Error('RxDB not initialized');
    const doc = await db.collections.shopping_list_item.findOne(id).exec();
    if (!doc) throw new Error('Shopping list item not found');
    await doc.patch({ completed: !doc.completed });
  }

  async function deleteShoppingListItem(id: string) {
    if (!db) throw new Error('RxDB not initialized');
    const doc = await db.collections.shopping_list_item.findOne(id).exec();
    if (!doc) throw new Error('Shopping list item not found');
    await doc.remove();
  }

  /**
   * Helper for adding items from pantry - accepts product_id and quantity
   */
  async function addItemFromPantry(shopping_list_id: string, product_id: string, quantity: number) {
    if (!db) throw new Error('RxDB not initialized');
    
    // Fetch product details to populate name and unit
    const product = await db.collections.product.findOne(product_id).exec();
    if (!product) throw new Error('Product not found');
    
    return addShoppingListItem({
      shopping_list_id,
      product_id,
      name: product.name,
      unit: product.unit,
      quantity
    });
  }
  /**
   * Helper for adding manual items (no product_id) - requires name and unit
   */
  async function addManualItem(
    shopping_list_id: string,
    name: string,
    unit: string,
    quantity: number,
    count: number = 1,
    comment?: string
  ) {
    return addShoppingListItem({
      shopping_list_id,
      name,
      unit,
      quantity,
      count,
      comment
    });
  }

  return {
    addShoppingListItem,
    updateShoppingListItem,
    toggleShoppingListItemCompleted,
    deleteShoppingListItem,
    addItemFromPantry,
    addManualItem
  };
}
