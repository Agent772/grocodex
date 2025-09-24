import React, { useState, useEffect } from 'react';
import { RxDocument } from 'rxdb';
import { Box, Typography, TextField, Skeleton, Breadcrumbs, useTheme, Link, useMediaQuery, Badge, Fab, Paper, Chip, Snackbar, Alert, Backdrop } from '@mui/material';
import SpeedDial from '@mui/material/SpeedDial';
import SpeedDialAction from '@mui/material/SpeedDialAction';
import SpeedDialIcon from '@mui/material/SpeedDialIcon';
import AddBoxIcon from '@mui/icons-material/AddBox';
import LocalDiningIcon from '@mui/icons-material/LocalDining';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import CloseIcon from '@mui/icons-material/Close';
import MoveUpIcon from '@mui/icons-material/MoveUp';
import Masonry from '@mui/lab/Masonry';
import { useRxDB } from 'rxdb-hooks';
import { ContainerDocType } from '../../../types/dbCollections';
import { ContainerCard } from './ContainerCard';
import GroceryItemCard from '../groceryItems/GroceryItemCard';
import AddContainerDialog from './ContainerNewEdit';
import GroceryItemAddDialog from '../groceryItems/GroceryItemAddDialog';
import ContainerSelectionDialog from './ContainerSelectionDialog';
import { useTranslation } from 'react-i18next';
import { GroceryItemDocType } from '../../../types/dbCollections';

const ContainerOverview: React.FC = () => {
  const db = useRxDB();
  const [search, setSearch] = useState('');
  const [containers, setContainers] = useState<ContainerDocType[]>([]);
  const [parentId, setParentId] = useState<string | null>(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [addGroceryOpen, setAddGroceryOpen] = useState(false);
  const [groceryItems, setGroceryItems] = useState<GroceryItemDocType[]>([]);
  const [speedDialOpen, setSpeedDialOpen] = useState(false);
  
  // Selection mode states
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedGroceries, setSelectedGroceries] = useState<Set<string>>(new Set());
  const [containerSelectionOpen, setContainerSelectionOpen] = useState(false);
  
  // Notification states
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  }>({
    open: false,
    message: '',
    severity: 'info'
  });
  
  const theme = useTheme();
  const { t } = useTranslation();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const maxBreadcrumbItems = isMobile ? 3 : 5;

  // Selection mode functions
  const enterSelectionMode = () => {
    setSelectionMode(true);
    setSelectedGroceries(new Set());
  };

  const exitSelectionMode = () => {
    setSelectionMode(false);
    setSelectedGroceries(new Set());
  };

  const toggleGrocerySelection = (groceryId: string) => {
    const newSelection = new Set(selectedGroceries);
    if (newSelection.has(groceryId)) {
      newSelection.delete(groceryId);
    } else {
      newSelection.add(groceryId);
    }
    setSelectedGroceries(newSelection);
  };

  const showNotification = (message: string, severity: 'success' | 'error' | 'info' | 'warning') => {
    setNotification({
      open: true,
      message,
      severity
    });
  };

  const moveSelectedGroceries = async (targetContainerId: string) => {
    if (!db || selectedGroceries.size === 0) return;
    
    try {
      // Get all grocery items that match selected product IDs
      const currentContainerId = parentId || 'root'; // If at root level, use 'root'
      const itemsToMove = groceryItems.filter(item => 
        selectedGroceries.has(item.product_id) && 
        (item.container_id === currentContainerId || 
         (currentContainerId === 'root' && (item.container_id === 'root' || item.container_id === '' || item.container_id === null || item.container_id === undefined)))
      );
      
      if (itemsToMove.length === 0) {
        showNotification(t('move.noItemsFound', 'No items found to move'), 'warning');
        return;
      }
      
      // Update each item's container_id
      const updatePromises = itemsToMove.map(async (item) => {
        try {
          const doc = await db.collections.grocery_item.findOne(item.id).exec();
          if (!doc) {
            console.warn(`Document not found for item ${item.id}`);
            return;
          }
          
          const result = await doc.update({
            $set: {
              container_id: targetContainerId === 'root' ? 'root' : targetContainerId
            }
          });
          return result;
        } catch (error) {
          console.error(`Failed to update item ${item.id}:`, error);
          throw error;
        }
      });
      
      await Promise.all(updatePromises);
      
      // Get target container name for notification
      const targetContainer = targetContainerId === 'root'
        ? t('container.root', 'Root')
        : containers.find(c => c.id === targetContainerId)?.name || t('move.unknownContainer', 'Unknown Container');
      
      showNotification(
        t('move.success', 'Moved {{count}} item(s) to {{container}}', { 
          count: itemsToMove.length, 
          container: targetContainer 
        }), 
        'success'
      );
      
      exitSelectionMode();
    } catch (error) {
      console.error('Error moving groceries:', error);
      showNotification(t('move.error', 'Failed to move items'), 'error');
    }
  };

  useEffect(() => {
    if (!db) return;
    const sub = db.collections.container.find().$.subscribe((docs: RxDocument<ContainerDocType>[]) => {
      setContainers(docs.map(doc => doc.toJSON()));
    });
    let grocerySub: any;
    if (db.collections.grocery_item) {
      grocerySub = db.collections.grocery_item.find().$.subscribe((docs: RxDocument<GroceryItemDocType>[]) => {
        setGroceryItems(docs.map(doc => doc.toJSON()));
      });
    }
    return () => {
      sub.unsubscribe();
      if (grocerySub) grocerySub.unsubscribe();
    };
  }, [db]);

  // Clear selection when container changes
  useEffect(() => {
    if (selectionMode) {
      exitSelectionMode();
    }
  }, [parentId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Reset SpeedDial state when mobile breakpoint changes to fix initialization issues
  useEffect(() => {
    setSpeedDialOpen(false);
  }, [isMobile]);

  // Filter containers based on search or parentId
  let displayContainers: ContainerDocType[] = [];
  if (search.trim()) {
    const s = search.toLowerCase();
    displayContainers = containers.filter(c => c.name.toLowerCase().includes(s));
  } else if (parentId) {
    displayContainers = containers.filter(c => (c.parent_container_id || null) === (parentId || null));
  } else {
    displayContainers = containers.filter(c => !(c.parent_container_id || null));
  }

  // Get parent container for breadcrumb
  const parentContainer = parentId ? containers.find(c => c.id === parentId) : null;

  // Filter groceries for current container
  const groceriesInContainer = parentContainer
    ? groceryItems.filter(item => item.container_id === parentContainer.id)
    : groceryItems.filter(item => item.container_id === 'root' || item.container_id === '' || item.container_id === null || item.container_id === undefined); // Show root-level groceries (support legacy empty/null values)

  // Show skeletons per card slot if containers are not loaded
  const showSkeletons = !db || containers.length === 0;

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      pb={{ xs: 2, sm: 4, md: 4 }}
      sx={{ 
        position: 'relative', 
        height: '100%', 
        width: '100%',
        px: { xs: 2, sm: 3, md: 0 }
      }}
    >
      {!isMobile && (
        <Typography 
          variant="h4" 
          sx={{ width: '100%', maxWidth: { xs: '100%', md: 900 }, textAlign: 'center' }}
          >
            {t('containerOverview.title', 'Container Overview')}
          </Typography>
      )}
      {/* Dialogs for SpeedDial actions */}
      <AddContainerDialog
        open={addDialogOpen}
        onClose={() => setAddDialogOpen(false)}
        parentContainer={parentContainer || undefined}
        containerOptions={containers}
      />
      <GroceryItemAddDialog
        open={addGroceryOpen}
        onClose={() => setAddGroceryOpen(false)}
        // Pass parentContainer as container if inside a container
        {...(parentContainer ? { container: parentContainer } : {})}
      />
      
      <ContainerSelectionDialog
        open={containerSelectionOpen}
        onClose={() => setContainerSelectionOpen(false)}
        containers={containers}
        onSelectContainer={moveSelectedGroceries}
        currentContainerId={parentId || undefined}
        title={t('containerSelection.moveTitle', 'Move {{count}} item(s) to...', { count: selectedGroceries.size })}
      />
      <Box
        sx={{
          width: '100%',
          maxWidth: { xs: '100%', md: 900 },
          flex: 1,
          overflow: 'visible',
          pb: 2,
          mx: 'auto',
          borderRadius: { xs: 0, md: 3 },
          boxShadow: { xs: 'none', md: 3 },
          backgroundColor: { xs: 'transparent', md: 'background.paper' },
        }}
      >
        <Box sx={{ px: 2, pt: 2, pb: 1 }}>
          <TextField
            fullWidth
            label={t('containerOverview.searchLabel', 'Search containers')}
            variant="outlined"
            value={search}
            onChange={e => {
              setSearch(e.target.value);
              if (e.target.value) setParentId(null);
            }}
            size="small"
          />
        </Box>
        {parentContainer && (
          <Box sx={{ pb: 1, width: '100%', maxWidth: { xs: '100%', md: '95%' } }}>
            <Breadcrumbs 
              aria-label={t('aria.breadcrumb')} 
              maxItems={maxBreadcrumbItems} 
              itemsAfterCollapse={2} 
              itemsBeforeCollapse={1}
              separator="›"
            >
              {/* Build breadcrumb chain from root to parentContainer */}
              {(() => {
                const chain: ContainerDocType[] = [];
                let current: ContainerDocType | undefined | null = parentContainer;
                while (current) {
                  chain.unshift(current);
                  current = current.parent_container_id
                    ? containers.find(c => c.id === current?.parent_container_id) || null
                    : null;
                }
                return [
                  // Add root
                  <Link key="root" underline="hover" color="inherit" onClick={() => setParentId(null)} sx={{ cursor: 'pointer' }}>
                    {t('container.root')}
                  </Link>,
                  ...chain.map((c, idx) => (
                    <Link
                      key={c.id}
                      underline="hover"
                      color={idx === chain.length - 1 ? c.ui_color : 'inherit'}
                      onClick={() => setParentId(c.id)}
                      sx={{ cursor: 'pointer' }}
                    >
                      {c.name}
                    </Link>
                  ))
                ];
              })()}
            </Breadcrumbs>
          </Box>
        )}
        {displayContainers.length > 0 && (
        <Box
          sx={{
            // paddingTop: displayContainers.length === 0 ? 0 : 2,
            width: '100%',
            minHeight: displayContainers.length === 0 ? 0 : undefined,
            maxWidth: { xs: '100%', md: '95%' },
            mx: 'auto'
          }}
          >
            <Typography variant="h6" sx={{ mb: 2 }}>{t('common.containers', 'Container')}</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
              <Masonry
                columns={{ sm: 1, md: 2 }}
                spacing={1}
                sx={{
                  width: '95%',
                  minHeight: displayContainers.length === 0 ? 0 : undefined
                }}
              >
                {showSkeletons
                  ? [...Array(4)].map((_, idx) => (
                      <Skeleton key={idx} variant="rectangular" height={120} sx={{ mb: 2, borderRadius: 2 }} />
                    ))
                  : displayContainers.map(container => (
                      <Box key={container.id} sx={{ width: '100%', cursor: !search ? 'pointer' : 'default' }} onClick={() => {
                        if (!search) setParentId(container.id);
                      }}>
                        <ContainerCard containerId={container.id} />
                      </Box>
                    ))}
              </Masonry>
            </Box>
          </Box>
        )}
        {/* Groceries in current container */}
        {groceriesInContainer.length > 0 && (
          <Box sx={{ width: '100%', maxWidth: { xs: '100%', md: '95%' }, mt: 1 , mx: 'auto'}}>
            <Typography variant="h6" sx={{ mb: 2 }}>{t('common.groceries', 'Groceries')}</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
              <Masonry columns={{ sm: 1, md: 2 }} spacing={1} sx={{ width: '95%' }}>
                {/* Group groceries by product_id for GroceryItemCard */}
                {Object.values(
                  groceriesInContainer.reduce((acc, item) => {
                    if (!acc[item.product_id]) acc[item.product_id] = [] as GroceryItemDocType[];
                    acc[item.product_id].push(item);
                    return acc;
                  }, {} as Record<string, GroceryItemDocType[]>)
                ).map((items, idx) => {
                  const uniqueKey = `${items[0].product_id}-${idx}`;
                  return (
                    <Badge key={uniqueKey} badgeContent={items.length > 1 ? items.length : undefined} color="primary" sx={{ width: '100%' }}>
                      <GroceryItemCard 
                        groceryItems={items}
                        selectionMode={selectionMode}
                        isSelected={selectedGroceries.has(items[0].product_id)}
                        onSelectionChange={toggleGrocerySelection}
                      />
                    </Badge>
                  );
                })}
              </Masonry>
            </Box>
          </Box>
        )}
      </Box>
      
      {/* Selection Mode Floating Action Bar */}
      {selectionMode && (
        <Paper
          elevation={8}
          sx={{
            position: 'fixed',
            bottom: { xs: 72, md: 16 },
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            px: 3,
            py: 1.5,
            zIndex: 1000,
            borderRadius: 3,
            bgcolor: theme.palette.primary.main,
            color: theme.palette.primary.contrastText
          }}
        >
          <Chip
            label={t('selection.selectedCount', '{{count}} selected', { count: selectedGroceries.size })}
            size="small"
            sx={{ 
              bgcolor: theme.palette.primary.contrastText+'4D', // 30% opacity
              color: 'inherit',
              fontWeight: 'medium'
            }}
          />
          
          <Fab
            size="small"
            color="secondary"
            onClick={() => {
              setContainerSelectionOpen(true);
            }}
            disabled={selectedGroceries.size === 0}
            sx={{ mx: 1 }}
          >
            <MoveUpIcon />
          </Fab>
          
          <Fab
            size="small"
            onClick={exitSelectionMode}
            sx={{ 
              bgcolor: 'rgba(255, 255, 255, 0.2)', 
              color: 'inherit',
              '&:hover': {
                bgcolor: 'rgba(255, 255, 255, 0.3)'
              }
            }}
          >
            <CloseIcon />
          </Fab>
        </Paper>
      )}
      
      {/* SpeedDial for actions - hidden in selection mode */}
      {!selectionMode && (
        <SpeedDial
          key={`speeddial-${isMobile}`}
          ariaLabel={t('containerOverview.aria.speedDialLabel', 'Container actions')}
          open={speedDialOpen}
          onOpen={() => setSpeedDialOpen(true)}
          onClose={() => setSpeedDialOpen(false)}
          sx={{
            position: 'fixed',
            bottom: { xs: 72, md: 32 },
            right: 32,
            zIndex: 1000,
            '& .MuiSpeedDialAction-fab': {
              bgcolor: theme.palette.grey[900],
              color: theme.palette.text.primary,
              boxShadow: theme.shadows[12],
              '&:hover': {
                bgcolor: theme.palette.action.hover
              }
            }
          }}
          icon={<SpeedDialIcon />}
        >
          <SpeedDialAction
            icon={<AddBoxIcon />}
            onClick={() => setAddDialogOpen(true)}
            slotProps={{
              tooltip: {
                title: parentContainer
                  ? t('containerOverview.actions.addSubContainer', 'Add Sub-Container')
                  : t('containerOverview.actions.addContainer', 'Add Container'),
                open: false
              }
            }}
          />
          <SpeedDialAction
            icon={<LocalDiningIcon />}
            onClick={() => setAddGroceryOpen(true)}
            slotProps={{
              tooltip: {
                title: t('containerOverview.actions.addGroceryItem', 'Add Grocery Item'),
                open: false
              }
            }}
          />
          {/* Only show select action if there are groceries in current container */}
          {groceriesInContainer.length > 0 && (
            <SpeedDialAction
              icon={<CheckBoxIcon />}
              onClick={enterSelectionMode}
              slotProps={{
                tooltip: {
                  title: t('containerOverview.actions.selectGroceries', 'Select Groceries'),
                  open: false
                }
              }}
            />
          )}
        </SpeedDial>
      )}
      
      {/* Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={4000}
        onClose={() => setNotification(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setNotification(prev => ({ ...prev, open: false }))} 
          severity={notification.severity}
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export { ContainerOverview };
