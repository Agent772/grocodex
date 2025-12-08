import { RxCollection, RxDatabase } from 'rxdb';
import { ShoppingListDocType, ShoppingListItemDocType, GrocodexCollections } from '../../../types/dbCollections';

/**
 * Adds pre-insert and pre-save hooks to the shopping_list collection to automatically
 * set created_at and updated_at timestamps.
 *
 * @param collection - The RxCollection instance for shopping lists.
 */
export function addShoppingListTimestampHooks(
  collection: RxCollection<ShoppingListDocType>
) {
  collection.preInsert((doc) => {
    const now = new Date().toISOString();
    if (!doc.created_at) {
      doc.created_at = now;
    }
    if (!doc.updated_at) {
      doc.updated_at = now;
    }
  }, false);

  collection.preSave((doc) => {
    doc.updated_at = new Date().toISOString();
  }, false);
}

/**
 * Adds pre-insert and pre-save hooks to the shopping_list_item collection to automatically
 * set created_at, updated_at timestamps, and default completed status.
 * Also validates that items have either product_id or both name and unit.
 *
 * @param collection - The RxCollection instance for shopping list items.
 * @param db - The RxDatabase instance containing all collections.
 */
export function addShoppingListItemHooks(
  collection: RxCollection<ShoppingListItemDocType>,
  db: RxDatabase<GrocodexCollections>
) {
  collection.preInsert((doc) => {
    const now = new Date().toISOString();
    if (!doc.created_at) {
      doc.created_at = now;
    }
    if (!doc.updated_at) {
      doc.updated_at = now;
    }
    if (doc.completed == null) {
      doc.completed = false;
    }

    // Validate: must have product_id OR (name AND unit)
    if (!doc.product_id && (!doc.name || !doc.unit)) {
      throw new Error('Shopping list item must have either product_id or both name and unit');
    }
  }, false);

  collection.preSave((doc) => {
    doc.updated_at = new Date().toISOString();

    // Validate: must have product_id OR (name AND unit)
    if (!doc.product_id && (!doc.name || !doc.unit)) {
      throw new Error('Shopping list item must have either product_id or both name and unit');
    }
  }, false);
}
