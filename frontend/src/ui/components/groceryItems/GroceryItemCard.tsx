import React from 'react';
import GroceryItemUseDialog from './GroceryItemUseDialog';
import GroceryItemEditDialog from './GroceryItemEditDialog';
import { useGroceryItemUse } from '../../hooks/useGroceryItemUse';
import { Card, Box, Typography, Chip, Avatar, IconButton, Collapse, Checkbox } from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import EditIcon from '@mui/icons-material/Edit';
import { GroceryItemDocType } from '../../../types/dbCollections';
import { useGroceryItemDetails } from '../../hooks/useGroceryItemDetails';
import { useContainers } from '../../hooks/useContainers';
import { ContainerBreadcrumbLabel } from '../containers/ContainerBreadcrumbLabel';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { useTranslation } from 'react-i18next';
import { getUnitLabel } from '../../utils/getUnitLabel';

export interface GroceryItemCardProps {
  groceryItems: GroceryItemDocType[];
  // Selection mode props
  selectionMode?: boolean;
  isSelected?: boolean;
  onSelectionChange?: (productId: string) => void;
}


const GroceryItemCard: React.FC<GroceryItemCardProps> = ({ 
  groceryItems, 
  selectionMode = false, 
  isSelected = false, 
  onSelectionChange 
}) => {
  const [useDialogOpen, setUseDialogOpen] = React.useState(false);
  const [editOpen, setEditOpen] = React.useState(false);
  const { useItem } = useGroceryItemUse(groceryItems);
  if (!groceryItems || groceryItems.length === 0) return null;
  const [expanded, setExpanded] = React.useState(false);
  const mainItem = groceryItems[0];
  const { product } = useGroceryItemDetails(mainItem);
  const containerOptions = useContainers();
  const { t } = useTranslation();

  const handleCardClick = () => {
    if (selectionMode) {
      // In selection mode, only checkbox should handle selection
      // Card click is disabled to prevent double-triggering
      return;
    } else if (!selectionMode) {
      setUseDialogOpen(true);
    }
  };

  // Group by container_id for location details
  const locationGroups = groceryItems.reduce<Record<string, GroceryItemDocType[]>>((acc, item) => {
    if (!acc[item.container_id]) acc[item.container_id] = [];
    acc[item.container_id].push(item);
    return acc;
  }, {});
  const locationIds = Object.keys(locationGroups);

  // Helper to get container object
  const getContainer = (id: string) => containerOptions.find(c => c.id === id);

  // Sum rest_quantity and product.quantity for all items
  const totalRestQuantity = groceryItems.reduce((sum, item) => sum + (item.rest_quantity ?? 0), 0);
  // If product.quantity is defined, multiply by number of items
  const totalProductQuantity = product?.quantity !== undefined ? groceryItems.length * product.quantity : undefined;

  // Check if all items share the same location
  const allSameLocation = groceryItems.every(item => item.container_id === mainItem.container_id);

  return (
    <>
      <Card
        sx={{ 
          position: 'relative', 
          display: 'flex', 
          flexDirection: 'column', 
          p: 2, 
          borderRadius: 2, 
          boxShadow: 2, 
          width: '100%', 
          cursor: selectionMode ? 'default' : 'pointer',
          // Selection mode styling - use subtle visual feedback that doesn't change layout
          opacity: selectionMode && isSelected ? 0.8 : 1,
          transform: selectionMode && isSelected ? 'scale(0.98)' : 'scale(1)',
          transition: 'opacity 0.2s, transform 0.2s'
        }}
        onClick={handleCardClick}
      >
      {/* Selection checkbox - top right in selection mode */}
      {selectionMode && (
        <Checkbox
          checked={isSelected}
          onChange={(e) => {
            e.stopPropagation();
            if (onSelectionChange && mainItem.product_id) {
              onSelectionChange(mainItem.product_id);
            }
          }}
          sx={{ 
            position: 'absolute', 
            top: 8, 
            right: 8, 
            zIndex: 2,
            bgcolor: 'background.paper',
            borderRadius: 1
          }}
        />
      )}
      
      {/* Edit button at top right - hidden in selection mode */}
      {!selectionMode && (
        <IconButton
          aria-label={t('aria.edit', 'Edit')}
          size="small"
          sx={{ position: 'absolute', top: 8, right: 8, zIndex: 2 }}
          onClick={e => {
            e.stopPropagation();
            setEditOpen(true);
          }}
        >
          <EditIcon />
        </IconButton>
      )}
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Avatar src={product?.image_url} sx={{ mr: 2 }} />
        <Typography variant="h6" sx={{ flexGrow: 1 }}>{product?.name || t('groceryCard.unknownProduct', 'Unknown Product')}</Typography>
      </Box>
      {/* Summary row: show location only if all items share it, else show hint */}
      <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {allSameLocation ? (
            <>
              <LocationOnIcon fontSize="small" sx={{ mr: 1, color: getContainer(mainItem.container_id)?.ui_color }} />
              {getContainer(mainItem.container_id) && containerOptions.length > 0 ? (
                <ContainerBreadcrumbLabel container={getContainer(mainItem.container_id)!} containerOptions={containerOptions} />
              ) : (
                <Typography variant="body2" color="text.secondary">{t('groceryCard.unknownLocation', 'Unknown Location')}</Typography>
              )}
            </>
          ) : (
            <>
              {groceryItems.length > 1 && !allSameLocation && (
                <IconButton
                  size="small"
                  onClick={e => { e.stopPropagation(); setExpanded(exp => !exp); }}
                  aria-label={t('groceryCard.aria.showLocations', 'Show locations')}
                  sx={{ p: 0, mr: 1 }}
                >
                  {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </IconButton>
              )}
              <Typography 
                variant="body2" 
                color="text.secondary" 
                sx={{ fontStyle: 'italic', fontSize: '0.85rem' }}  
                onClick={e => { e.stopPropagation(); setExpanded(exp => !exp); }}>
                    {t('groceryCard.expandToShowLocations', 'Expand to show locations')}
              </Typography>
            </>
          )}
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography variant="body1" sx={{ mr: 1 }}>
            {totalRestQuantity !== undefined && totalProductQuantity !== undefined
              ? `${totalRestQuantity}/${totalProductQuantity}`
              : totalRestQuantity ?? totalProductQuantity ?? '?'}
          </Typography>
          <Chip label={product?.unit ? getUnitLabel(product.unit, t) : ''} size="small" />
        </Box>
      </Box>
      {/* Expanded details for multiple locations with max height, scroll, and animation */}
      <Collapse in={expanded && locationIds.length > 1} timeout="auto" unmountOnExit>
        <Box sx={{ mt: 2, maxHeight: 220, overflowY: 'auto' }}>
          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>{t('groceryItem.locations', 'Locations:')}</Typography>
          {locationIds.map(locId => {
            const container = getContainer(locId);
            // Sum rest_quantity for this location
            const locRestQuantity = locationGroups[locId].reduce((sum, item) => sum + (item.rest_quantity ?? 0), 0);
            // Sum product.quantity for this location
            const locProductQuantity = product?.quantity !== undefined ? locationGroups[locId].length * product.quantity : undefined;
            return (
              <Box key={locId} sx={{ display: 'flex', mb: 1}}>
                <Chip label={`${locationGroups[locId].length}x`} size="small" color="primary" sx={{ mr: 1 }} />
                <LocationOnIcon fontSize="small" sx={{ mr: 1, color: container?.ui_color }} />
                {container ? (
                  <ContainerBreadcrumbLabel container={container} containerOptions={containerOptions} />
                ) : (
                  <Typography variant="body2" color="text.secondary">{t('groceryCard.unknownLocation', 'Unknown Location')}</Typography>
                )}
                <Box sx={{display: 'flex', alignItems: 'center', ml: 'auto'}}>
                    <Typography variant="body2" sx={{ ml: 2 }}>
                    {locRestQuantity !== undefined && locProductQuantity !== undefined
                        ? `${locRestQuantity}/${locProductQuantity}`
                        : locRestQuantity ?? locProductQuantity ?? '?'}
                    </Typography>
                    <Chip label={product?.unit ? getUnitLabel(product.unit, t) : ''} size="small" sx={{ ml: 1 }} />
                </Box>
              </Box>
            );
          })}
        </Box>
      </Collapse>
      </Card>
      <GroceryItemUseDialog
        open={useDialogOpen}
        onClose={() => setUseDialogOpen(false)}
        groceryItems={groceryItems}
        onSave={async (usedAmount) => {
          await useItem(usedAmount);
          setUseDialogOpen(false);
        }}
      />
      <GroceryItemEditDialog
        open={editOpen}
        groceryItems={groceryItems}
        onClose={() => setEditOpen(false)}
      />
    </>
  );
};

export default GroceryItemCard;
