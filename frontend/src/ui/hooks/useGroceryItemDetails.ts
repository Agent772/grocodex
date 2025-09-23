import { useEffect, useState } from 'react';
import { GroceryItemDocType, ProductDocType, ContainerDocType } from '../../types/dbCollections';
import { useRxDB } from 'rxdb-hooks';

export interface GroceryItemDetails {
  groceryItem: GroceryItemDocType;
  product?: ProductDocType;
  container?: ContainerDocType;
}

export function useGroceryItemDetails(groceryItem: GroceryItemDocType) {
  const db = useRxDB();
  const [details, setDetails] = useState<GroceryItemDetails>({ groceryItem });

  useEffect(() => {
    if (!db || !groceryItem) return;
    let cancelled = false;
    (async () => {
      const product = await db.collections.product.findOne({ selector: { id: groceryItem.product_id } }).exec();
      // Only query for container if container_id is not 'root' or legacy empty/null values
      const container = groceryItem.container_id && 
                       groceryItem.container_id !== 'root' && 
                       groceryItem.container_id !== ''
        ? await db.collections.container.findOne({ selector: { id: groceryItem.container_id } }).exec()
        : null;
      if (!cancelled) {
        setDetails({
          groceryItem,
          product: product ? product.toJSON() : undefined,
          container: container ? container.toJSON() : undefined,
        });
      }
    })();
    return () => { cancelled = true; };
  }, [db, groceryItem]);

  return details;
}
