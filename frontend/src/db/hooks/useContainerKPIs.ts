import { useRxData } from 'rxdb-hooks';
import { ContainerDocType } from '../../types/dbCollections';
import { GroceryItemDocType } from '../../types/dbCollections';

/**
 * Returns KPIs for a container: direct child containers and direct grocery items count.
 */
export function useContainerKPIs(containerId: string) {
  // Count direct child containers
  const { result: childContainers = [] } = useRxData<ContainerDocType>(
    'container',
    (collection) => collection.find({ selector: { parent_container_id: containerId } }),
    { json: true }
  );

  // Count direct grocery items
  const { result: groceryItems = [] } = useRxData<GroceryItemDocType>(
    'grocery_item',
    (collection) => collection.find({ selector: { container_id: containerId } }),
    { json: true }
  );

  return {
    childContainerCount: childContainers.length,
    groceryItemCount: groceryItems.length,
  };
}
