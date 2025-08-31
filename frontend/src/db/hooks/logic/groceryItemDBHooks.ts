import { RxCollection, RxDatabase } from 'rxdb';
import { GroceryItemDocType, GrocodexCollections, ProductDocType } from '../../../types/dbCollections';

/**
 * Adds a pre-insert hook to the given grocery item collection that sets default values for
 * `rest_quantity`, `buy_date`, and `opend` fields if `rest_quantity` is not provided.
 * 
 * - If `rest_quantity` is `null` or `undefined`, it fetches the corresponding product's quantity
 *   from the product collection and assigns it to `rest_quantity`.
 * - Sets `buy_date` to the current timestamp.
 * - Sets `opend` to `false`.
 *
 * @param collection - The RxCollection instance for grocery items.
 * @param db - The RxDatabase instance containing all collections.
 */
export function addRestQuantityDefaultHook(
  collection: RxCollection<GroceryItemDocType>,
  db: RxDatabase<GrocodexCollections>
) {
  collection.preInsert(async (doc) => {
    if (doc.rest_quantity == null) {
      const productCollection = db.collections.product as RxCollection<ProductDocType>;
      const productDoc = await productCollection.findOne({ selector: { id: doc.product_id } }).exec();
      doc.rest_quantity = productDoc?.quantity ?? 0;
    }
    if (doc.buy_date == null) {
      doc.buy_date = new Date().toISOString();
    }
    if (doc.is_opened == null) {
      doc.is_opened = false;
    }
  }, false);
}
