import React, { useState, useEffect } from 'react';
import Fab from '@mui/material/Fab';
import AddIcon from '@mui/icons-material/Add';
import { Box, Typography, TextField } from '@mui/material';
import GroceryItemAddDialog from './GroceryItemAddDialog';
import GroceryItemCard from './GroceryItemCard';
import Badge from '@mui/material/Badge';
import { useRxDB } from 'rxdb-hooks';
import { GroceryItemDocType } from '../../../types/dbCollections';
import Masonry from '@mui/lab/Masonry';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@mui/material/styles';
import { useMediaQuery } from '@mui/material';

const GroceryOverview: React.FC = () => {
  const [search, setSearch] = useState('');
  const [productGroups, setProductGroups] = useState<Record<string, string>>({});
  const [products, setProducts] = useState<Record<string, string>>({});
  const [addGroceryOpen, setAddGroceryOpen] = useState(false);
  const { t } = useTranslation();
  const db = useRxDB();
  const [groceryItems, setGroceryItems] = useState<GroceryItemDocType[]>([]);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    if (!db) return;
    const sub = db.collections.grocery_item.find().$.subscribe(docs => {
      setGroceryItems(docs.map(doc => doc.toJSON()));
    });
    // fetch product groups and products for search
    const fetchMeta = async () => {
      const pgDocs = await db.collections.product_group.find().exec();
      const pDocs = await db.collections.product.find().exec();
      setProductGroups(Object.fromEntries(pgDocs.map((doc: any) => [doc.id, doc.name])));
      setProducts(Object.fromEntries(pDocs.map((doc: any) => [doc.id, doc.name])));
    };
    fetchMeta();
    return () => sub.unsubscribe();
  }, [db]);

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      pt={{ xs: 2, sm: 4, md: 4 }}
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
          mb={2}
          sx={{ width: '100%', maxWidth: { xs: '100%', md: 900 }, textAlign: 'center' }}
        >
          {t('GroceryOverview.title', 'Pantry Overview')}
      </Typography>
      )}
      <GroceryItemAddDialog open={addGroceryOpen} onClose={() => setAddGroceryOpen(false)} />
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
            label={t('GroceryOverview.searchPlaceholder', 'Search pantry items')}
            variant="outlined"
            value={search}
            onChange={e => setSearch(e.target.value)}
            size="small"
          />
        </Box>
        <Box display={'flex'} justifyContent={'center'} sx={{ paddingTop: 2 }}>
          <Masonry columns={{ sm: 1, md: 2 }} spacing={1} sx={{width: '95%', px: 2}}>
            {Object.entries(
              groceryItems.reduce((acc, item) => {
                if (!acc[item.product_id]) acc[item.product_id] = [];
                acc[item.product_id].push(item);
                return acc;
              }, {} as Record<string, GroceryItemDocType[]>)
            )
            .filter(([productId, items]) => {
              if (!search.trim()) return true;
              const productName = products[productId]?.toLowerCase() || '';
              const s = search.toLowerCase();
              return productName.includes(s);
            })
            .map(([productId, items]) => (
                <Badge key={productId} badgeContent={items.length > 1 ? items.length : undefined} color="primary" sx={{ width: '100%' }}>
                  <GroceryItemCard groceryItems={items} />
                </Badge>
            ))}
          </Masonry>
        </Box>
      </Box>
      <Fab
        color="primary"
        aria-label={t('GroceryOverview.aria.addGroceryItem', 'Add Grocery Item')}
        sx={{
          position: 'fixed',
          bottom: { xs: 72, md: 32 },
          right: 32,
          zIndex: 1000
        }}
        onClick={() => setAddGroceryOpen(true)}
      >
        <AddIcon />
      </Fab>
    </Box>
  )
}
export { GroceryOverview };
