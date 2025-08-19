import { RxCollection } from 'rxdb';
import {
  ContainerDocType,
  SupermarketDocType,
  SupermarketProductDocType,
  ProductGroupDocType,
  ProductDocType,
  GroceryItemDocType,
  ShoppingListDocType,
  ShoppingListItemDocType
} from './dbCollections';

export type GrocodexCollections = {
  container: RxCollection<ContainerDocType>;
  supermarket: RxCollection<SupermarketDocType>;
  supermarket_product: RxCollection<SupermarketProductDocType>;
  product_group: RxCollection<ProductGroupDocType>;
  product: RxCollection<ProductDocType>;
  grocery_item: RxCollection<GroceryItemDocType>;
  shopping_list: RxCollection<ShoppingListDocType>;
  shopping_list_item: RxCollection<ShoppingListItemDocType>;
};
