import { ProductGroupDocType, ProductDocType } from '../../types/dbCollections';
import { useRxQuery, useRxDB } from 'rxdb-hooks';

export interface ProductGroupDetails {
  productGroup: ProductGroupDocType | null;
  products: ProductDocType[];
  loading: boolean;
  error?: string | null;
}

export function useProductGroupDetails(productGroupId: string): ProductGroupDetails {
  const db = useRxDB();
  // Query for the product group
  if (!db) {
    return { productGroup: null, products: [], loading: true };
  }
  const groupQuery = db.product_group.find({ selector: { id: productGroupId }, limit: 1 });
  const { result: productGroupDocs, isFetching: groupLoading } = useRxQuery(groupQuery);

  // Query for products in the group
  const productsQuery = db.product.find({ selector: { product_group_id: productGroupId } });
  const { result: productDocs, isFetching: productsLoading } = useRxQuery(productsQuery);

  // Convert RxDB docs to plain objects
  const productGroup = productGroupDocs && productGroupDocs.length > 0 && typeof productGroupDocs[0].toJSON === 'function'
    ? productGroupDocs[0].toJSON() as ProductGroupDocType
    : null;
  const products = productDocs && productDocs.length > 0
    ? productDocs.map((doc: any) => (typeof doc.toJSON === 'function' ? doc.toJSON() as ProductDocType : doc))
    : [];
  const loading = groupLoading || productsLoading;

  return { productGroup, products, loading };
}
