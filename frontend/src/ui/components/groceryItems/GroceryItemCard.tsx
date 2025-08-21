import React from 'react';
import { Card, Box, Typography, Chip, Avatar, IconButton } from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { GroceryItemDocType } from '../../../types/dbCollections';
import { useGroceryItemDetails } from '../../hooks/useGroceryItemDetails';
import { useContainers } from '../../hooks/useContainers';
import { ContainerBreadcrumbLabel } from '../containers/ContainerBreadcrumbLabel';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

export interface GroceryItemCardProps {
  groceryItems: GroceryItemDocType[];
}


const GroceryItemCard: React.FC<GroceryItemCardProps> = ({ groceryItems }) => {
  if (!groceryItems || groceryItems.length === 0) return null;
  const [expanded, setExpanded] = React.useState(false);
  const mainItem = groceryItems[0];
  const { product } = useGroceryItemDetails(mainItem);
  const containerOptions = useContainers();

  // Group by container_id for location details
  const locationGroups = groceryItems.reduce<Record<string, GroceryItemDocType[]>>((acc, item) => {
    if (!acc[item.container_id]) acc[item.container_id] = [];
    acc[item.container_id].push(item);
    return acc;
  }, {});
  const locationIds = Object.keys(locationGroups);

  // Helper to get container object
  const getContainer = (id: string) => containerOptions.find(c => c.id === id);

  return (
  <Card sx={{ display: 'flex', flexDirection: 'column', p: 2, mb: 2, borderRadius: 2, boxShadow: 2, width: '100%' }}>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Avatar src={product?.image_url} sx={{ mr: 2 }} />
        <Typography variant="h6" sx={{ flexGrow: 1 }}>{product?.name || 'Unknown Product'}</Typography>
        {groceryItems.length > 1 && (
          <IconButton size="small" onClick={() => setExpanded(e => !e)} aria-label="Show locations">
            {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        )}
      </Box>
      {/* Summary row: show first location and quantity, badge if multiple */}
      <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <LocationOnIcon fontSize="small" sx={{ mr: 1, color: getContainer(mainItem.container_id)?.ui_color }} />
          {getContainer(mainItem.container_id) && containerOptions.length > 0 ? (
            <ContainerBreadcrumbLabel container={getContainer(mainItem.container_id)!} containerOptions={containerOptions} />
          ) : (
            <Typography variant="body2" color="text.secondary">Unknown Location</Typography>
          )}
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography variant="body1" sx={{ mr: 1 }}>
            {mainItem.rest_quantity !== undefined && product?.quantity !== undefined
              ? `${mainItem.rest_quantity}/${product.quantity}`
              : mainItem.rest_quantity ?? product?.quantity ?? '?'}
          </Typography>
          <Chip label={product?.unit || ''} size="small" />
        </Box>
      </Box>
      {/* Expanded details for multiple locations */}
      {expanded && locationIds.length > 1 && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>Locations:</Typography>
          {locationIds.map(locId => {
            const container = getContainer(locId);
            return (
              <Box key={locId} sx={{ display: 'flex', alignItems: 'center', mb: 1, pl: 2 }}>
                <LocationOnIcon fontSize="small" sx={{ mr: 1, color: container?.ui_color }} />
                {container ? (
                  <ContainerBreadcrumbLabel container={container} containerOptions={containerOptions} />
                ) : (
                  <Typography variant="body2" color="text.secondary">Unknown Location</Typography>
                )}
                <Typography variant="body2" sx={{ ml: 2 }}>
                  {locationGroups[locId].map(item =>
                    item.rest_quantity !== undefined && product?.quantity !== undefined
                      ? `${item.rest_quantity}/${product.quantity}`
                      : item.rest_quantity ?? product?.quantity ?? '?'
                  ).join(', ')}
                </Typography>
                <Chip label={product?.unit || ''} size="small" sx={{ ml: 1 }} />
                <Chip label={`${locationGroups[locId].length}x`} size="small" color="primary" sx={{ ml: 1 }} />
              </Box>
            );
          })}
        </Box>
      )}
    </Card>
  );
};

export default GroceryItemCard;
