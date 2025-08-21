import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Paper, TextField, IconButton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import AddBoxIcon from '@mui/icons-material/AddBox';
import AddContainerDialog from '../components/containers/ContainerNewEdit';
import GroceryItemAddDialog from '../components/groceryItems/GroceryItemAddDialog';
import GroceryItemCard from '../components/groceryItems/GroceryItemCard';
import Badge from '@mui/material/Badge';
import { useRxDB } from '../../db/RxDBProvider';
import { GroceryItemDocType } from '../../types/dbCollections';
import { useContainers } from '../hooks/useContainers';

const PantryOverview: React.FC = () => {
  const [search, setSearch] = useState('');
  const [addContainerOpen, setAddContainerOpen] = useState(false);
  const [addGroceryOpen, setAddGroceryOpen] = useState(false);

  const containers = useContainers();
  const db = useRxDB();
  const [groceryItems, setGroceryItems] = useState<GroceryItemDocType[]>([]);

  useEffect(() => {
    if (!db) return;
    const sub = db.collections.grocery_item.find().$.subscribe(docs => {
      setGroceryItems(docs.map(doc => doc.toJSON()));
    });
    return () => sub.unsubscribe();
  }, [db]);

  return (
    <Box display="flex" flexDirection="column" alignItems="center" pt={4} pb={4}>
      <Typography variant="h4" mb={2}>Pantry Overview (Debug)</Typography>
      <Button
        variant="contained"
        color="primary"
        startIcon={<AddBoxIcon />}
        sx={{ mb: 2 }}
        onClick={() => setAddContainerOpen(true)}
      >
        Add Container
      </Button>
      <AddContainerDialog open={addContainerOpen} onClose={() => setAddContainerOpen(false)} containerOptions={containers} />
      <Button
        variant="contained"
        color="primary"
        sx={{ mb: 2, mr: 2 }}
        onClick={() => setAddGroceryOpen(true)}
      >
        Add Grocery Item
      </Button>
      <GroceryItemAddDialog open={addGroceryOpen} onClose={() => setAddGroceryOpen(false)} />
      {/* Debug table: Containers */}
      <TableContainer component={Paper} sx={{ mt: 4, maxWidth: 480 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Parent Container</TableCell>
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

      {/* Grocery Items List View */}
  <Box sx={{ width: '100%', maxWidth: '100%', mt: 4 }}>
        <Typography variant="h6" mb={2}>Your Pantry Items</Typography>
        {/* Group grocery items by product_id */}
        {Object.entries(
          groceryItems.reduce((acc, item) => {
            if (!acc[item.product_id]) acc[item.product_id] = [];
            acc[item.product_id].push(item);
            return acc;
          }, {} as Record<string, GroceryItemDocType[]>)
        ).map(([productId, items]) => (
          <Box key={productId} sx={{ width: '100%', mb: 2 }}>
            <Badge badgeContent={items.length > 1 ? items.length : undefined} color="primary" sx={{ width: '100%' }}>
              <GroceryItemCard groceryItems={items} />
            </Badge>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default PantryOverview;
export { PantryOverview };
