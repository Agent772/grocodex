import { GroceryItemDocType } from '../../../types/dbCollections';
import { useRxDB } from '../../../db/RxDBProvider';

export function useGroceryItemUse(groceryItems: GroceryItemDocType[]) {
  const db = useRxDB();

  // Use the first item for updating opened state/flag
  const mainItem = groceryItems[0];

  const useItem = async (usedAmount: number) => {
    if (!db) return;
    let remaining = usedAmount;
    // Sort by: least rest_quantity, earlier opened, closest expiration date
    const sortedItems = [...groceryItems].sort((a, b) => {
      // 1. Least rest_quantity
      const restA = a.rest_quantity ?? 0;
      const restB = b.rest_quantity ?? 0;
      if (restA !== restB) return restA - restB;

  // 2. Earlier opened (opened_date ascending, undefined last)
  const openedA = a.opened_date ? new Date(a.opened_date).getTime() : Infinity;
  const openedB = b.opened_date ? new Date(b.opened_date).getTime() : Infinity;
  if (openedA !== openedB) return openedA - openedB;

      // 3. Closest expiration date (expiration_date ascending, undefined last)
      const expA = a.expiration_date ? new Date(a.expiration_date).getTime() : Infinity;
      const expB = b.expiration_date ? new Date(b.expiration_date).getTime() : Infinity;
      return expA - expB;
    });
    for (const item of sortedItems) {
      if (remaining <= 0) break;
      const doc = await db.collections.grocery_item.findOne({ selector: { id: item.id } }).exec();
      if (!doc) continue;
      const currentRest = doc.rest_quantity ?? 0;
      if (currentRest > 0) {
        const toUse = Math.min(currentRest, remaining);
        const newRest = currentRest - toUse;
        if (newRest <= 0) {
          // Delete the grocery item if depleted
          await doc.remove();
        } else {
          await doc.update({
            $set: {
              rest_quantity: newRest,
              opened: true,
              opened_at: new Date().toISOString(),
            }
          });
        }
        remaining -= toUse;
      }
    }
  };

  return { useItem };
}
