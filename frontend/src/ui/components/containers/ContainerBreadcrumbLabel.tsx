import React from 'react';
import { ContainerDocType } from '../../../types/dbCollections';

interface ContainerBreadcrumbLabelProps {
  container: ContainerDocType;
  containerOptions: ContainerDocType[];
}

export const ContainerBreadcrumbLabel: React.FC<ContainerBreadcrumbLabelProps> = ({ container, containerOptions }) => {
  // Build breadcrumb label for a container
  let label = container.name;
  let current = container;
  const visited = new Set();
  while (current.parent_container_id && !visited.has(current.parent_container_id)) {
    visited.add(current.parent_container_id);
    const parentObj = containerOptions.find(c => c.id === current.parent_container_id);
    if (parentObj) {
      label = parentObj.name + ' > ' + label;
      current = parentObj;
    } else {
      break;
    }
  }
  return <span>{label}</span>;
};

export function getContainerBreadcrumbLabel(container: ContainerDocType, containerOptions: ContainerDocType[]): string {
  let label = container.name;
  let current = container;
  const visited = new Set();
  while (current.parent_container_id && !visited.has(current.parent_container_id)) {
    visited.add(current.parent_container_id);
    const parentObj = containerOptions.find(c => c.id === current.parent_container_id);
    if (parentObj) {
      label = parentObj.name + ' > ' + label;
      current = parentObj;
    } else {
      break;
    }
  }
  return label;
}
