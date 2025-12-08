import { useRxData } from 'rxdb-hooks';
import { ShoppingListItemDocType } from '../../types/dbCollections';

/**
 * Hook to fetch all items for a specific shopping list
 */
export function useShoppingListItems(listId?: string) {
  const { result: items, isFetching } = useRxData<ShoppingListItemDocType>(
    'shopping_list_item',
    (collection) => 
      listId 
        ? collection.find({ selector: { shopping_list_id: listId } }).sort({ created_at: 'asc' })
        : collection.find({ selector: { shopping_list_id: 'none' } }),
    { json: true }
  );

  const shoppingListItems: ShoppingListItemDocType[] = Array.isArray(items)
    ? items.map((doc) => (typeof (doc as any).toJSON === 'function' ? (doc as any).toJSON() as ShoppingListItemDocType : doc as ShoppingListItemDocType))
    : [];

  // Calculate stats
  const totalItems = shoppingListItems.length;
  const completedItems = shoppingListItems.filter(item => item.completed).length;
  const incompleteItems = totalItems - completedItems;

  return { 
    shoppingListItems, 
    isFetching,
    stats: {
      total: totalItems,
      completed: completedItems,
      incomplete: incompleteItems
    }
  };
}
