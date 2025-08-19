import { RxCollection } from 'rxdb';
import { ShoppingListItemDocType } from '../../../types/dbCollections';

/**
 * Validates shopping list item: must have either product_id, or both name and unit filled.
 * Throws error if validation fails.
 */
export function addShoppingListItemValidationHook(collection: RxCollection<ShoppingListItemDocType>) {
  collection.preInsert((doc) => {
    if (!doc.product_id) {
      if (!doc.name || !doc.unit) {
        const error: any = new Error('Shopping list item must have either a product_id or both name and unit filled.');
        error.error = 'ERR_SHOPPING_LIST_ITEM_VALIDATION';
        throw error;
      }
    }
  }, false);
}
