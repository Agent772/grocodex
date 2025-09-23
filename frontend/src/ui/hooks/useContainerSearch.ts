import { useRxDB } from 'rxdb-hooks';
import { ContainerDocType } from '../../types/dbCollections';
import { useEffect, useState } from 'react';

export function useContainerSearch() {
  const db = useRxDB();
  const [containers, setContainers] = useState<ContainerDocType[]>([]);

  useEffect(() => {
    if (!db) return;
    const sub = db.collections.container.find().$.subscribe(docs => {
      setContainers(docs.map(doc => doc.toJSON()));
    });
    return () => sub.unsubscribe();
  }, [db]);

  return { containers };
}
