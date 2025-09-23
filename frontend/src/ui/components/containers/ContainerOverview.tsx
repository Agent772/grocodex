import React, { useState, useEffect } from 'react';
import { RxDocument } from 'rxdb';
import { Box, Typography, TextField, Skeleton, Breadcrumbs, useTheme, Link, useMediaQuery, Badge } from '@mui/material';
import SpeedDial from '@mui/material/SpeedDial';
import SpeedDialAction from '@mui/material/SpeedDialAction';
import SpeedDialIcon from '@mui/material/SpeedDialIcon';
import AddBoxIcon from '@mui/icons-material/AddBox';
import LocalDiningIcon from '@mui/icons-material/LocalDining';
import Masonry from '@mui/lab/Masonry';
import { useRxDB } from 'rxdb-hooks';
import { ContainerDocType } from '../../../types/dbCollections';
import { ContainerCard } from './ContainerCard';
import GroceryItemCard from '../groceryItems/GroceryItemCard';
import AddContainerDialog from './ContainerNewEdit';
import GroceryItemAddDialog from '../groceryItems/GroceryItemAddDialog';
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
  const theme = useTheme();
  const { t } = useTranslation();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const maxBreadcrumbItems = isMobile ? 3 : 5;

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

  // Filter containers based on search or parentId
  let displayContainers: ContainerDocType[] = [];
  if (search.trim()) {
    const s = search.toLowerCase();
    displayContainers = containers.filter(c => c.name.toLowerCase().includes(s));
  } else if (parentId) {
    displayContainers = containers.filter(c => c.parent_container_id === parentId);
  } else {
    displayContainers = containers.filter(c => !c.parent_container_id);
  }

  // Get parent container for breadcrumb
  const parentContainer = parentId ? containers.find(c => c.id === parentId) : null;

  // Filter groceries for current container
  const groceriesInContainer = parentContainer
    ? groceryItems.filter(item => item.container_id === parentContainer.id)
    : [];

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
      <Box
        sx={{
          width: '100%',
          maxWidth: { xs: '100%', md: 900 },
          flex: 1,
          overflow: 'auto',
          pb: 8,
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
                  //px: 2,
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
        {parentContainer && groceriesInContainer.length > 0 && (
          <Box sx={{ width: '100%', maxWidth: { xs: '100%', md: '95%' }, mt: 1 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>{t('common.groceries', 'Groceries')}</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
              <Masonry columns={{ sm: 1, md: 2 }} spacing={1} sx={{ width: '95%', px: 2 }}>
                {/* Group groceries by product_id for GroceryItemCard */}
                {Object.values(
                  groceriesInContainer.reduce((acc, item) => {
                    if (!acc[item.product_id]) acc[item.product_id] = [] as GroceryItemDocType[];
                    acc[item.product_id].push(item);
                    return acc;
                  }, {} as Record<string, GroceryItemDocType[]>)
                ).map((items, idx) => (
                  <Badge key={items[0].id || idx} badgeContent={items.length > 1 ? items.length : undefined} color="primary" sx={{ width: '100%' }}>
                    <GroceryItemCard groceryItems={items} />
                  </Badge>
                ))}
              </Masonry>
            </Box>
          </Box>
        )}
      </Box>
      {/* SpeedDial for actions */}
      <SpeedDial
        ariaLabel={t('containerOverview.aria.speedDialLabel', 'Container actions')}
        sx={{
          position: 'fixed',
          bottom: { xs: 72, md: 32 },
          right: 32,
          zIndex: 1000
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
      </SpeedDial>
    </Box>
  );
};

export { ContainerOverview };
