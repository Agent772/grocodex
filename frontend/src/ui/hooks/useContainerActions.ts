import { useRxDB } from 'rxdb-hooks';
import { ContainerDocType } from '../../types/dbCollections';

export function useContainerActions() {
  const db = useRxDB();

  async function addOrUpdateContainer(container: ContainerDocType) {
    if (!db) throw new Error('RxDB not initialized');
    const collection = db.collections.container;
    const existing = await collection.findOne({ selector: { id: container.id } }).exec();
    if (existing) {
      await existing.update({
        $set: { ...container }
      });
    } else {
      await collection.insert(container);
    }
  }

  return { addOrUpdateContainer };
}
