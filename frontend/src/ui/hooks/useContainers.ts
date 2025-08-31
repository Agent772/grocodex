import { useEffect, useState } from 'react';
import { useRxDB } from 'rxdb-hooks';
import { ContainerDocType } from '../../types/dbCollections';

export function useContainers() {
  const db = useRxDB();
  const [containers, setContainers] = useState<ContainerDocType[]>([]);

  useEffect(() => {
    if (!db) return;
    const sub = db.collections.container.find().$.subscribe(docs => {
      setContainers(docs.map(doc => doc.toJSON()));
    });
    return () => sub.unsubscribe();
  }, [db]);

  return containers;
}
