import React, { useState } from 'react';
import { Box, Typography, Button, Paper, TextField, IconButton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { useEffect } from 'react';
import AddBoxIcon from '@mui/icons-material/AddBox';
import AddContainerDialog from '../components/containers/ContainerNewEdit';
import GroceryItemAddDialog from '../components/groceryItems/GroceryItemAddDialog';
import Masonry from '@mui/lab/Masonry';
import { useTranslation } from 'react-i18next';
import { UI_TRANSLATION_KEYS } from '../../types/uiTranslationKeys';
import { usePantryDebugData } from '../hooks/usePantryDebugData';
import { useContainers } from '../hooks/useContainers';

const PantryOverview: React.FC = () => {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [addContainerOpen, setAddContainerOpen] = useState(false);
  const [addGroceryOpen, setAddGroceryOpen] = useState(false);

  // Container list from DB
  const containers = useContainers();
  const { rows: pantryDebugRows } = usePantryDebugData();

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

      {/* Debug table: GroceryItems, Products, ProductGroups */}
      <TableContainer component={Paper} sx={{ mt: 4, maxWidth: 960 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Product Group Name</TableCell>
              <TableCell>Product Name</TableCell>
              <TableCell>GroceryItem ID</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {pantryDebugRows.map(row => (
              <TableRow key={row.groceryItemId}>
                <TableCell>{row.productGroupName}</TableCell>
                <TableCell>{row.productName}</TableCell>
                <TableCell>{row.groceryItemId}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default PantryOverview;
export { PantryOverview };
