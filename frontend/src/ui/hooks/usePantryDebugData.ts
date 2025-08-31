import { useEffect, useState } from 'react';
import { useRxDB } from 'rxdb-hooks';

export interface PantryDebugRow {
  groceryItemId: string;
  productName: string;
  productGroupName: string;
}

export function usePantryDebugData() {
  const db = useRxDB();
  const [rows, setRows] = useState<PantryDebugRow[]>([]);

  useEffect(() => {
    if (!db) return;
    // Subscribe to grocery items
    const sub = db.collections.grocery_item.find().$.subscribe(async docs => {
      const groceryItems = docs.map(doc => doc.toJSON());
      // Fetch all products and product groups once
      const products = await db.collections.product.find().exec();
      const productGroups = await db.collections.product_group.find().exec();
      // Build lookup maps
      const productMap = new Map(products.map(p => [p.id, p]));
      const productGroupMap = new Map(productGroups.map(pg => [pg.id, pg]));
      // Build rows
      const newRows: PantryDebugRow[] = groceryItems.map(item => {
        const product = productMap.get(item.product_id);
        const productGroup = product ? productGroupMap.get(product.product_group_id) : undefined;
        return {
          groceryItemId: item.id,
          productName: product?.name || '',
          productGroupName: productGroup?.name || '',
        };
      });
      setRows(newRows);
    });
    return () => sub.unsubscribe();
  }, [db]);

  return { rows };
}
