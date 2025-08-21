import { useRxDB } from '../../db/RxDBProvider';
import { ContainerDocType } from '../../types/dbCollections';
import { useEffect, useState } from 'react';

export function useContainerSearch() {
  const db = useRxDB();
  const [containers, setContainers] = useState<ContainerDocType[]>([]);

  useEffect(() => {
    let cancelled = false;
    async function fetchContainers() {
      if (!db) return;
      try {
        const results = await db.collections.container.find().exec();
        if (!cancelled) setContainers(results.map(doc => doc.toJSON()));
      } catch (err) {
        if (!cancelled) setContainers([]);
      }
    }
    fetchContainers();
    return () => { cancelled = true; };
  }, [db]);

  return { containers };
}
