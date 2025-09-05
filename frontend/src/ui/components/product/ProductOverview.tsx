import React, { useState, useEffect } from 'react';
import { Box, Typography, TextField, useTheme, useMediaQuery } from '@mui/material';
import Masonry from '@mui/lab/Masonry';
import { useRxDB } from 'rxdb-hooks';
import { ProductGroupDocType } from '../../../types/dbCollections';
import ProductCard from './ProductCard';
import ProductGroupEditDialog from './ProductGroupEditDialog';
import { useTranslation } from 'react-i18next';

const ProductOverview: React.FC = () => {
  const db = useRxDB();
  const [search, setSearch] = useState('');
  const [productGroups, setProductGroups] = useState<ProductGroupDocType[]>([]);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { t } = useTranslation();

  // Dialog state for editing product group
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
    const sub = db.collections.product_group.find().$.subscribe(docs => {
      setProductGroups(docs.map(doc => doc.toJSON()));
    });
    return () => sub.unsubscribe();
  }, [db]);

  // Filter product groups by search
  const filteredGroups = productGroups.filter(group =>
    group.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Box 
      display="flex"
      flexDirection="column"
      alignItems="center"
      //pt={{ xs: 2, sm: 4, md: 4 }}
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
          //mb={2}
          sx={{ width: '100%', maxWidth: { xs: '100%', md: 900 }, textAlign: 'center' }}
        >
          {t('productOverview.title', 'Product Overview')}
        </Typography>
      )}
      {/* <GroceryItemAddDialog open={addGroceryOpen} onClose={() => setAddGroceryOpen(false)} /> */}
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
          <Masonry columns={{ sm: 1, md: 2 }} spacing={1} sx={{ width: '95%', px: 2 }}>
            {filteredGroups.map(group => (
              <Box key={group.id} sx={{ width: '100%' }}>
                <ProductCard productGroupId={group.id} onEditGroup={handleEditGroup} />
              </Box>
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
  </Box>
 );
};

export { ProductOverview };
