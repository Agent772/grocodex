import React, { useState } from 'react';
import { Box, Typography, Button, Paper, TextField, IconButton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { useEffect } from 'react';
import { addOrUpdateContainer, getAllContainers } from '../../db/entities/container';
import AddBoxIcon from '@mui/icons-material/AddBox';
import AddContainerDialog from '../components/containers/ContainerNewEdit';
import GroceryItemAddDialog from '../components/groceryItems/GroceryItemAddDialog';
import Masonry from '@mui/lab/Masonry';
import { useTranslation } from 'react-i18next';
import { UI_TRANSLATION_KEYS } from '../../types/uiTranslationKeys';
import { useGroceryItems } from '../../db/hooks/useGroceryItems';
import { useProducts } from '../../db/hooks/useProducts';

const PantryOverview: React.FC = () => {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [addContainerOpen, setAddContainerOpen] = useState(false);
  const [addGroceryOpen, setAddGroceryOpen] = useState(false);

  // Container list from DB
  const [containers, setContainers] = useState<Array<{ id: string; name: string; parent_container_id?: string }>>([]);

  // Load containers from DB on mount
  useEffect(() => {
    getAllContainers().then(dbContainers => {
      setContainers(dbContainers);
    });
  }, []);

  // Refresh containers from DB
  const refreshContainers = async () => {
    const dbContainers = await getAllContainers();
    setContainers(dbContainers);
  };
  // Placeholder for results, replace with real data
  type PantryResult = {
    name: string;
    brand?: string;
    image?: string;
    container?: string;
    quantity?: number;
    expiration?: string;
  };
  const results: PantryResult[] = [];

  // PantryItemCard subcomponent
  const PantryItemCard: React.FC<{ item: PantryResult }> = ({ item }) => (
    <Paper elevation={3} sx={{ p: 2 }}>
      <Box display="flex" flexDirection="column" alignItems="center">
        <Box
          component="img"
          src={item.image || '/placeholder.png'}
          alt={item.name}
          sx={{ width: '100%', maxWidth: 180, height: 120, objectFit: 'cover', mb: 1, borderRadius: 2 }}
        />
        <Typography variant="h6" align="center">{item.name}</Typography>
        {item.brand && <Typography variant="body2" color="text.secondary" align="center">{item.brand}</Typography>}
        {item.container && <Typography variant="body2" align="center">{item.container}</Typography>}
        {item.quantity !== undefined && <Typography variant="body2" align="center">Qty: {item.quantity}</Typography>}
        {item.expiration && <Typography variant="body2" align="center">Exp: {item.expiration}</Typography>}
      </Box>
    </Paper>
  );

  const groceryItems = useGroceryItems();
  const products = useProducts();
  const productList = products.products || [];

  return (
    <Box display="flex" flexDirection="column" alignItems="center" pt={4} pb={4}>
      <Typography variant="h4" mb={2}>
        {t(UI_TRANSLATION_KEYS.PANTRY_TITLE, 'Pantry Overview')}
      </Typography>
      <Box display="flex" alignItems="center" width="100%" maxWidth={480} mb={3}>
        <TextField
          label={t('pantry.search', 'Search by name or brand')}
          variant="outlined"
          value={search}
          onChange={e => setSearch(e.target.value)}
          sx={{ flex: 1, mr: 2 }}
        />
        <IconButton color="primary" aria-label={t('container.add', 'Add Container')} onClick={() => setAddContainerOpen(true)}>
          <AddBoxIcon />
        </IconButton>
      </Box>
      <AddContainerDialog
        open={addContainerOpen}
        onClose={() => setAddContainerOpen(false)}
        onSaved={refreshContainers}
        containerOptions={containers.map(c => ({ id: c.id, name: c.name, parentId: c.parent_container_id }))}
      />
      <IconButton color="primary" aria-label={t('grocery.add', 'Add Grocery Item')} onClick={() => setAddGroceryOpen(true)}>
          <AddBoxIcon />
        </IconButton>
      <GroceryItemAddDialog open={addGroceryOpen} onClose={() => setAddGroceryOpen(false)} />

      {/* Temporary debug table of containers */}
      <TableContainer component={Paper} sx={{ mt: 4, maxWidth: 480 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Parent ID</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {containers.map(c => (
              <TableRow key={c.id}>
                <TableCell>{c.id}</TableCell>
                <TableCell>{c.name}</TableCell>
                <TableCell>{c.parent_container_id || '-'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      {/* Debug table for grocery items */}
      <table style={{ width: '100%', marginTop: 24, borderCollapse: 'collapse', background: '#fafafa' }}>
        <thead>
          <tr>
            <th style={{ border: '1px solid #ccc', padding: 4 }}>GroceryItem ID</th>
            <th style={{ border: '1px solid #ccc', padding: 4 }}>Product Name</th>
            <th style={{ border: '1px solid #ccc', padding: 4 }}>Product Brand</th>
            <th style={{ border: '1px solid #ccc', padding: 4 }}>Product Group Name</th>
          </tr>
        </thead>
        <tbody>
          {groceryItems.items.map(item => {
            const product = productList.find(p => p.id === item.product_id);
            return (
              <tr key={item.id}>
                <td style={{ border: '1px solid #ccc', padding: 4 }}>{item.id}</td>
                <td style={{ border: '1px solid #ccc', padding: 4 }}>{product?.name || ''}</td>
                <td style={{ border: '1px solid #ccc', padding: 4 }}>{product?.brand || ''}</td>
                <td style={{ border: '1px solid #ccc', padding: 4 }}>{product?.product_group_id || ''}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {results.length === 0 ? (
        <Paper elevation={2} sx={{ width: '100%', maxWidth: 480, p: 3, mb: 2 }}>
          <Typography variant="body1" color="text.secondary" align="center">
            {t(UI_TRANSLATION_KEYS.PANTRY_EMPTY, 'No pantry items yet. Start by adding your groceries!')}
          </Typography>
          <Box display="flex" justifyContent="center" mt={2}>
            <Button variant="contained" color="primary" onClick={() => setAddGroceryOpen(true)}>
              {t(UI_TRANSLATION_KEYS.PANTRY_ADD, 'Add Item')}
            </Button>
          </Box>
        </Paper>
      ) : (
        <Box sx={{ width: '100%', maxWidth: 960 }}>
          <Masonry columns={{ xs: 1, sm: 2, md: 3 }} spacing={2}>
            {results.map((item, idx) => (
              <PantryItemCard item={item} key={idx} />
            ))}
          </Masonry>
        </Box>
      )}
    </Box>
  );
};

export default PantryOverview;
