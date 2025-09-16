import React, { useState, useEffect } from 'react';
import { Box, Typography, TextField, useTheme, useMediaQuery, Fab } from '@mui/material';
import Masonry from '@mui/lab/Masonry';
import AddIcon from '@mui/icons-material/Add';
import { useRxDB } from 'rxdb-hooks';
import { ProductGroupDocType } from '../../../types/dbCollections';
import ProductCard from './ProductCard';
import ProductGroupEditDialog from './ProductGroupEditDialog';
import ProductEditDialog from './ProductEditDialog';
import { useTranslation } from 'react-i18next';
import ProductAddDialog from './ProductAddDialog';
import { RxDocument } from 'rxdb';

const ProductOverview: React.FC = () => {
  // Expanded state for product groups
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
  const [editProductDialogOpen, setEditProductDialogOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<any | null>(null);

  const [addDialogOpen, setAddDialogOpen] = useState(false);

  const handleEditProduct = async (productId: string) => {
    if (!db) return;
    const product = await db.collections.product.findOne(productId).exec();
    if (product) {
      setEditProduct(product.toJSON());
      setEditProductDialogOpen(true);
    }
  };

  const handleEditProductDialogClose = () => {
    setEditProductDialogOpen(false);
    setEditProduct(null);
  };
  const db = useRxDB();
  const [search, setSearch] = useState('');
  const [productGroups, setProductGroups] = useState<ProductGroupDocType[]>([]);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { t } = useTranslation();

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editGroupId, setEditGroupId] = useState<string | null>(null);

  const handleEditGroup = (groupId: string) => {
    setEditGroupId(groupId);
    setEditDialogOpen(true);
  };

  const handleEditDialogClose = () => {
    setEditDialogOpen(false);
    setEditGroupId(null);
  };

  useEffect(() => {
    if (!db) return;
    const sub = db.collections.product_group.find().$.subscribe((docs: RxDocument<ProductGroupDocType>[])=> {
      setProductGroups(docs.map(doc => doc.toJSON()));
    });
    return () => sub.unsubscribe();
  }, [db]);

  const filteredGroups = productGroups.filter(group =>
    group.name.toLowerCase().includes(search.toLowerCase())
  );

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
          {t('productOverview.title', 'Product Overview')}
        </Typography>
      )}
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
            label={t('productOverview.search', 'Search products')}
            variant="outlined"
            value={search}
            onChange={e => setSearch(e.target.value)}
            size="small"
          />
        </Box>
        <Box display={'flex'} justifyContent={'center'} sx={{ paddingTop: 2 }}>
          <Masonry columns={{ xs: 1, sm: 1, md: 2, lg: 2 }} spacing={1} sx={{ width: '95%', px: 2 }}>
            {filteredGroups.map(group => (
              <ProductCard
                key={group.id + '-' + (expandedGroups[group.id] ? 'expanded' : 'collapsed')}
                productGroupId={group.id}
                expanded={!!expandedGroups[group.id]}
                onToggleExpanded={() =>
                  setExpandedGroups(prev => ({
                    ...prev,
                    [group.id]: !prev[group.id]
                  }))
                }
                onEditGroup={handleEditGroup}
                onEditProduct={handleEditProduct}
              />
            ))}
          </Masonry>
        </Box>
      </Box>
    {/* Edit dialog for product group */}
    <ProductGroupEditDialog
      open={editDialogOpen}
      productGroupId={editGroupId}
      onClose={handleEditDialogClose}
    />
    {/* Edit dialog for product */}
    {editProductDialogOpen && (
      <React.Suspense fallback={null}>
        {/* @ts-ignore */}
        <ProductEditDialog
          open={editProductDialogOpen}
          product={editProduct}
          onClose={handleEditProductDialogClose}
        />
      </React.Suspense>
    )}
    {/* Add dialog for product/product group */}
    {addDialogOpen && (
      <ProductAddDialog
        open={addDialogOpen}
        onClose={() => setAddDialogOpen(false)}
      />
    )}
    <Fab
        color="primary"
        aria-label={t('ProductOverview.aria.addProduct', 'Add Product')}
        sx={{
          position: 'fixed',
          bottom: { xs: 72, md: 32 },
          right: 32,
          zIndex: 1000
        }}
        onClick={() => setAddDialogOpen(true)}
      >
        <AddIcon />
      </Fab>
  </Box>
 );
};

export { ProductOverview };
