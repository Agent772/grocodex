import { useRxData } from 'rxdb-hooks';
import { ShoppingListDocType } from '../../types/dbCollections';

/**
 * Hook to fetch all shopping lists, sorted by creation date (newest first)
 */
export function useShoppingLists() {
  const { result: lists, isFetching } = useRxData<ShoppingListDocType>(
    'shopping_list',
    (collection) => collection.find().sort({ created_at: 'desc' }),
    { json: true }
  );

  const shoppingLists: ShoppingListDocType[] = Array.isArray(lists)
    ? lists.map((doc) => (typeof (doc as any).toJSON === 'function' ? (doc as any).toJSON() as ShoppingListDocType : doc as ShoppingListDocType))
    : [];

  return { shoppingLists, isFetching };
}

/**
 * Hook to fetch a single shopping list by ID
 */
export function useShoppingList(listId?: string) {
  const { result: list, isFetching } = useRxData<ShoppingListDocType>(
    'shopping_list',
    (collection) => listId ? collection.findOne(listId) : collection.findOne({ selector: { id: 'none' } }),
    { json: true }
  );

  const shoppingList: ShoppingListDocType | undefined = list 
    ? (typeof (list as any).toJSON === 'function' ? (list as any).toJSON() as ShoppingListDocType : list as ShoppingListDocType)
    : undefined;

  return { shoppingList, isFetching };
}
