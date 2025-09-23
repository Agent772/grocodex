import React, { useState } from 'react';
import { Box, Button, Typography } from '@mui/material';
import SimpleGroceryItemEditDialog from './SimpleGroceryItemEditDialog';
import { GroceryItemDocType } from '../../../types/dbCollections';

// Demo component to test SimpleGroceryItemEditDialog
const SimpleGroceryItemEditDialogDemo: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [groceryItems, setGroceryItems] = useState<GroceryItemDocType | GroceryItemDocType[]>([]);

  // Mock data for testing
  const mockSingleItem: GroceryItemDocType = {
    id: 'item1',
    product_id: 'product1',
    container_id: 'container1',
    rest_quantity: 5,
    buy_date: '2023-12-01',
    expiration_date: '2023-12-15',
    notes: 'Single item test',
    created_at: '2023-12-01T00:00:00.000Z',
    updated_at: '2023-12-01T00:00:00.000Z'
  };

  const mockMultipleItems: GroceryItemDocType[] = [
    {
      id: 'item1',
      product_id: 'product1',
      container_id: 'container1',
      rest_quantity: 5,
      buy_date: '2023-12-01',
      expiration_date: '2023-12-15',
      notes: 'First item',
      created_at: '2023-12-01T00:00:00.000Z',
      updated_at: '2023-12-01T00:00:00.000Z'
    },
    {
      id: 'item2',
      product_id: 'product2',
      container_id: 'container2',
      rest_quantity: 3,
      buy_date: '2023-12-02',
      expiration_date: '2023-12-20',
      notes: 'Second item',
      created_at: '2023-12-02T00:00:00.000Z',
      updated_at: '2023-12-02T00:00:00.000Z'
    },
    {
      id: 'item3',
      product_id: 'product3',
      container_id: 'container3',
      rest_quantity: 8,
      buy_date: '2023-12-03',
      expiration_date: '2023-12-25',
      notes: 'Third item',
      created_at: '2023-12-03T00:00:00.000Z',
      updated_at: '2023-12-03T00:00:00.000Z'
    }
  ];

  const openSingleItem = () => {
    setGroceryItems(mockSingleItem);
    setOpen(true);
  };

  const openMultipleItems = () => {
    setGroceryItems(mockMultipleItems);
    setOpen(true);
  };

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h5" sx={{ mb: 3 }}>
        SimpleGroceryItemEditDialog Demo
      </Typography>
      
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <Button variant="contained" onClick={openSingleItem}>
          Open Single Item Dialog
        </Button>
        <Button variant="contained" onClick={openMultipleItems}>
          Open Multiple Items Dialog (Carousel)
        </Button>
      </Box>

      <Typography variant="body2" color="text.secondary">
        This demo shows how the SimpleGroceryItemEditDialog can handle both single items 
        and arrays of items. When multiple items are provided, it uses an Embla carousel 
        with navigation dots and arrow keys for switching between items.
      </Typography>

      <SimpleGroceryItemEditDialog
        open={open}
        groceryItems={groceryItems}
        onClose={() => setOpen(false)}
        onSaved={() => console.log('Item saved!')}
      />
    </Box>
  );
};

export default SimpleGroceryItemEditDialogDemo;