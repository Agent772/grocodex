import React, { useState, useEffect } from 'react';
import SpeedDial from '@mui/material/SpeedDial';
import SpeedDialAction from '@mui/material/SpeedDialAction';
import SpeedDialIcon from '@mui/material/SpeedDialIcon';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { Grid, Box, Typography, Button, Paper, TextField, IconButton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip } from '@mui/material';
import AddBoxIcon from '@mui/icons-material/AddBox';
import AddContainerDialog from '../components/containers/ContainerNewEdit';
import GroceryItemAddDialog from '../components/groceryItems/GroceryItemAddDialog';
import GroceryItemCard from '../components/groceryItems/GroceryItemCard';
import Badge from '@mui/material/Badge';
import { useRxDB } from '../../db/RxDBProvider';
import { GroceryItemDocType } from '../../types/dbCollections';
import { useContainers } from '../hooks/useContainers';
import Masonry from '@mui/lab/Masonry';

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
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      pt={{ xs: 2, sm: 4, md: 4 }}
      pb={{ xs: 2, sm: 4, md: 4 }}
      sx={{ position: 'relative', height: '100%', width: '100%' }}
    >
      <Typography variant="h4" mb={2} sx={{ width: '100%', maxWidth: { xs: '100%', md: 900 }, textAlign: 'center' }}>Pantry Overview</Typography>
      <AddContainerDialog open={addContainerOpen} onClose={() => setAddContainerOpen(false)} containerOptions={containers} />
      <GroceryItemAddDialog open={addGroceryOpen} onClose={() => setAddGroceryOpen(false)} />
      <Box
        sx={{
          width: '100%',
          maxWidth: { xs: '100%', md: 900 },
          //mt: { xs: 2, sm: 4 },
          flex: 1,
          overflow: 'auto',
          pb: 8,
          mx: 'auto',
          borderRadius: { xs: 0, md: 3 },
          boxShadow: { xs: 'none', md: 3 },
          backgroundColor: { xs: 'transparent', md: 'background.paper' },
        }}
      >
        {/* Group grocery items by product_id */}
        <Box display={'flex'} justifyContent={'center'} sx={{ paddingTop: 2 }}>
          <Masonry columns={{ sm: 1, md: 2 }} spacing={1} sx={{width: '95%', px: 2}}>
            {Object.entries(
              groceryItems.reduce((acc, item) => {
                if (!acc[item.product_id]) acc[item.product_id] = [];
                acc[item.product_id].push(item);
                return acc;
              }, {} as Record<string, GroceryItemDocType[]>)
            ).map(([productId, items]) => (
                <Badge badgeContent={items.length > 1 ? items.length : undefined} color="primary" sx={{ width: '100%' }}>
                  <GroceryItemCard groceryItems={items} />
                </Badge>
            ))}
          </Masonry>
        </Box>
      </Box>
      <SpeedDial
        ariaLabel="Pantry actions"
        sx={{ 
          position: 'fixed', 
          bottom: { xs: 72, md: 32 }, 
          right: 32 }}
        icon={<SpeedDialIcon />}
      >
        <SpeedDialAction
          icon={<AddBoxIcon />}
          slotProps={{
            tooltip: {
              title: "Add Container",
              open: false
            }
          }}
          onClick={() => setAddContainerOpen(true)}
        />
        <SpeedDialAction
          icon={<ShoppingCartIcon />}
          slotProps={{
            tooltip: {
              title: "Add Grocery Item",
              open: false
            }
          }}
          onClick={() => setAddGroceryOpen(true)}
        />
      </SpeedDial>
    </Box>
  )
}
export { PantryOverview };
