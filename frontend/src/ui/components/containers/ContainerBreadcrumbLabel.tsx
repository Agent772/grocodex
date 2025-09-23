import React from 'react';
import Tooltip from '@mui/material/Tooltip';
import { ContainerDocType } from '../../../types/dbCollections';
import { TFunction } from 'i18next';

interface ContainerBreadcrumbLabelProps {
  container: ContainerDocType;
  containerOptions: ContainerDocType[];
}

export const ContainerBreadcrumbLabel: React.FC<ContainerBreadcrumbLabelProps> = ({ container, containerOptions }) => {
  // Build breadcrumb array for a container
  let labels: string[] = [container.name];
  let current = container;
  const visited = new Set();
  while (current.parent_container_id && !visited.has(current.parent_container_id)) {
    visited.add(current.parent_container_id);
    const parentObj = containerOptions.find(c => c.id === current.parent_container_id);
    if (parentObj) {
      labels.unshift(parentObj.name);
      current = parentObj;
    } else {
      break;
    }
  }
  const fullLabel = labels.join(' > ');
  let displayLabel = fullLabel;
  if (labels.length > 3) {
    displayLabel = '... > ' + labels.slice(-3).join(' > ');
  }
  return (
    <Tooltip title={fullLabel} arrow>
      <span style={{ cursor: labels.length > 3 ? 'pointer' : undefined }}>
        {displayLabel}
      </span>
    </Tooltip>
  );
};

export function getContainerBreadcrumbLabel(container: ContainerDocType, containerOptions: ContainerDocType[], t: TFunction): string {
  let label = container.name;
  let current = container;
  const visited = new Set();
  while (current.parent_container_id && !visited.has(current.parent_container_id)) {
    visited.add(current.parent_container_id);
    const parentObj = containerOptions.find(c => c.id === current.parent_container_id);
    if (parentObj) {
      label = parentObj.name + ' ' + t('container.breadcrumb.separator','>') + ' ' + label;
      current = parentObj;
    } else {
      break;
    }
  }
  return label;
}
