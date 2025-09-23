import { useMemo } from 'react';
import { useRxData } from 'rxdb-hooks';
import { ContainerDocType } from '../../types/dbCollections';


export function useContainer(containerId?: string): {
  container?: ContainerDocType;
  breadcrumb: ContainerDocType[];
  containers: ContainerDocType[];
  isFetching: boolean;
} {
  // Fetch all containers once
  const { result: containers, isFetching } = useRxData<ContainerDocType>(
    'container',
    (collection) => collection.find(),
    { json: true }
  );

  // Build breadcrumb synchronously from containers
  const docs: ContainerDocType[] = Array.isArray(containers)
    ? containers.map((doc) => (typeof (doc as any).toJSON === 'function' ? (doc as any).toJSON() as ContainerDocType : doc as ContainerDocType))
    : [];

  const container = useMemo(() => {
    if (!containerId || docs.length === 0) return undefined;
    return docs.find((c) => c.id === containerId);
  }, [containerId, docs]);

  const breadcrumb = useMemo(() => {
    if (!containerId || docs.length === 0) return [];
    const chain: ContainerDocType[] = [];
    let current = docs.find((c) => c.id === containerId);
    while (current) {
      chain.unshift(current);
      current = current.parent_container_id ? docs.find((c) => c.id === current!.parent_container_id) : undefined;
    }
    return chain;
  }, [containerId, docs]);


  return { container, breadcrumb, containers: docs, isFetching };
}
