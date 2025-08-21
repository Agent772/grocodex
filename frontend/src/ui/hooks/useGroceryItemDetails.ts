import { useEffect, useState } from 'react';
import { GroceryItemDocType, ProductDocType, ContainerDocType } from '../../types/dbCollections';
import { useRxDB } from '../../db/RxDBProvider';

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
      const container = await db.collections.container.findOne({ selector: { id: groceryItem.container_id } }).exec();
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
