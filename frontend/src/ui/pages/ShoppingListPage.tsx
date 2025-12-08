import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Autocomplete,
  TextField,
  Button,
  Fab,
  useTheme,
  useMediaQuery,
  Divider,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useRxDB } from 'rxdb-hooks';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import { useShoppingLists } from '../hooks/useShoppingLists';
import { useShoppingListItems } from '../hooks/useShoppingListItems';
import { useShoppingListActions } from '../hooks/useShoppingListActions';
import { useShoppingListItemActions } from '../hooks/useShoppingListItemActions';
import { useAppConfig } from '../../db/hooks/logic/appConfigDBHooks';
import { useUpdateCurrentShoppingList } from '../../db/hooks/logic/appConfigDBHooks';
import { ShoppingListItemEditDialog } from '../components/shoppingList/ShoppingListItemEditDialog';
import { ShoppingListItemCard } from '../components/shoppingList/ShoppingListItemCard';
import { ManageShoppingListsDialog } from '../components/shoppingList/ManageShoppingListsDialog';
import { ShoppingListDocType, ShoppingListItemDocType } from '../../types/dbCollections';

const ShoppingListPage: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const config = useAppConfig();
  const { shoppingLists, isFetching } = useShoppingLists();
  const [selectedList, setSelectedList] = useState<ShoppingListDocType | undefined>(undefined);
  const { updateCurrentShoppingList } = useUpdateCurrentShoppingList();
  const { shoppingListItems, stats } = useShoppingListItems(selectedList?.id);
  const { addShoppingList } = useShoppingListActions();
  const { toggleShoppingListItemCompleted, deleteShoppingListItem } = useShoppingListItemActions();
  
  const [manageDialogOpen, setManageDialogOpen] = useState(false);
  const [itemDialogOpen, setItemDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ShoppingListItemDocType | undefined>();
  const [pendingListId, setPendingListId] = useState<string | null>(null);
  const isCreatingDefaultList = useRef(false);

  // Load the current shopping list from config on mount
  useEffect(() => {
    const initializeList = async () => {
      // Don't do anything while still fetching or config not loaded
      if (isFetching || !config) {
        return;
      }
      
      if (shoppingLists.length === 0 && !isCreatingDefaultList.current) {
        // Create a default list if none exists
        isCreatingDefaultList.current = true;
        try {
          const newListId = await addShoppingList(t('shoppingList.defaultListName'));
          setPendingListId(newListId);
        } catch (error) {
          console.error('Error creating default shopping list:', error);
          isCreatingDefaultList.current = false;
        }
        return;
      }
      
      if (shoppingLists.length > 0) {
        isCreatingDefaultList.current = false;
        
        // Priority 1: Handle pending list from creation
        if (pendingListId) {
          const pendingList = shoppingLists.find(list => list.id === pendingListId);
          if (pendingList) {
            setSelectedList(pendingList);
            await updateCurrentShoppingList(pendingList.id);
            setPendingListId(null);
            return;
          }
        }
        
        // Priority 2: Restore from saved config
        if (!selectedList && config.current_shopping_list_id) {
          const savedList = shoppingLists.find(list => list.id === config.current_shopping_list_id);
          if (savedList) {
            setSelectedList(savedList);
            return; // Don't update config, already saved
          }
        }
        
        // Priority 3: Select first list if nothing selected
        if (!selectedList) {
          setSelectedList(shoppingLists[0]);
          await updateCurrentShoppingList(shoppingLists[0].id);
        }
        
        // Priority 4: Check if selected list still exists (handle deletion)
        if (selectedList) {
          const stillExists = shoppingLists.find(list => list.id === selectedList.id);
          if (!stillExists) {
            // Sort by created_at descending to get the newest list
            const newestList = [...shoppingLists].sort((a, b) => 
              new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
            )[0];
            if (newestList) {
              setSelectedList(newestList);
              await updateCurrentShoppingList(newestList.id);
            }
          }
        }
      }
    };
    
    initializeList();
  }, [isFetching, shoppingLists, config, pendingListId]);

  // Save the selected list to config whenever it changes
  const handleListChange = async (newList: ShoppingListDocType | undefined) => {
    setSelectedList(newList);
    try {
      await updateCurrentShoppingList(newList?.id || null);
    } catch (error) {
      console.error('Error saving current shopping list:', error);
    }
  };

  const handleAddList = async () => {
    try {
      // Find the next number for the new list
      const existingNumbers = shoppingLists
        .map(list => {
          const match = list.name.match(/Shopping List (\d+)/);
          return match ? parseInt(match[1], 10) : 0;
        })
        .filter(num => num > 0);
      
      const nextNumber = existingNumbers.length > 0 ? Math.max(...existingNumbers) + 1 : 1;
      const newListName = `Shopping List ${nextNumber}`;
      
      // Create the new list
      const newListId = await addShoppingList(newListName);
      
      // Set as pending so it gets selected when it appears in the list
      setPendingListId(newListId);
    } catch (error) {
      console.error('Error creating new shopping list:', error);
    }
  };

  const handleListDeleted = async (listId: string) => {
    if (selectedList?.id === listId) {
      // Select the most recently created list after deletion
      const remainingLists = shoppingLists.filter(list => list.id !== listId);
      if (remainingLists.length > 0) {
        // Sort by created_at descending to get the newest list
        const newestList = remainingLists.sort((a, b) => 
          new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
        )[0];
        await handleListChange(newestList);
      }
    }
  };

  const handleAddItem = () => {
    setEditingItem(undefined);
    setItemDialogOpen(true);
  };

  const handleEditItem = (item: ShoppingListItemDocType) => {
    setEditingItem(item);
    setItemDialogOpen(true);
  };

  const handleToggleComplete = async (itemId: string) => {
    try {
      await toggleShoppingListItemCompleted(itemId);
    } catch (error) {
      console.error('Error toggling item completion:', error);
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (window.confirm(t('shoppingList.confirmDeleteItem'))) {
      try {
        await deleteShoppingListItem(itemId);
      } catch (error) {
        console.error('Error deleting item:', error);
      }
    }
  };

  return (
    <Container 
      maxWidth="md" 
      sx={{ 
        py: { xs: 1, md: 3 },
        px: { xs: 0, md: 0 }
      }}
    >
      <Paper 
        elevation={isMobile ? 0 : 2} 
        sx={{ 
          p: { xs: 2, md: 3 },
          backgroundColor: { xs: 'transparent', md: 'background.paper' },
          height: '85vh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Typography variant="h5" component="h1" gutterBottom align="center">
          {t('shoppingList.title')}
        </Typography>

        {/* List Selector */}
        <Box sx={{ display: 'flex', gap: 1, mb: 3, alignItems: 'stretch' }}>
          <Autocomplete
            value={selectedList || null}
            onChange={(_, newValue) => handleListChange(newValue || undefined)}
            options={shoppingLists}
            getOptionLabel={(option) => option.name}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            loading={isFetching}
            sx={{ flexGrow: 1 }}
            disableClearable
            renderInput={(params) => (
              <TextField
                {...params}
                label={t('shoppingList.list')}
                placeholder={t('shoppingList.searchLists')}
              />
            )}
            noOptionsText={t('shoppingList.noLists')}
          />
          <Button
            variant="outlined"
            onClick={handleAddList}
            sx={{ minWidth: 'auto', px: 2 }}
          >
            <AddIcon />
          </Button>
          <Button
            variant="outlined"
            color="secondary"
            onClick={() => setManageDialogOpen(true)}
            sx={{ minWidth: 'auto', px: 2 }}
          >
            <EditIcon />
          </Button>
        </Box>

        {selectedList && (
          <>

            {/* Items List */}
            {shoppingListItems.length === 0 ? (
              <Typography align="center" color="text.secondary" sx={{ my: 4 }}>
                {t('shoppingList.emptyList')}
              </Typography>
            ) : (
              <Box sx={{ 
                overflowY: 'auto',
                flexGrow: 1,
                flexShrink: 1,
                minHeight: 0,
                pr: 1
              }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {/* Incomplete Items */}
                {shoppingListItems
                  .filter(item => !item.completed)
                  .map((item) => (
                    <ShoppingListItemCard
                      key={item.id}
                      item={item}
                      onToggleComplete={() => handleToggleComplete(item.id)}
                      onEdit={() => handleEditItem(item)}
                      onDelete={() => handleDeleteItem(item.id)}
                    />
                  ))}
                
                {/* Divider between incomplete and completed */}
                {stats.completed > 0 && stats.incomplete > 0 && (
                  <Divider sx={{ my: 1 }} />
                )}
                
                {/* Completed Items */}
                {shoppingListItems
                  .filter(item => item.completed)
                  .map((item) => (
                    <ShoppingListItemCard
                      key={item.id}
                      item={item}
                      onToggleComplete={() => handleToggleComplete(item.id)}
                      onEdit={() => handleEditItem(item)}
                      onDelete={() => handleDeleteItem(item.id)}
                    />
                  ))}
                </Box>
              </Box>
            )}

            {/* Add Item FAB */}
            <Fab
              color="primary"
              aria-label={t('shoppingList.addItem')}
              onClick={handleAddItem}
              sx={{
                position: 'fixed',
                bottom: { xs: 72, md: 24 },
                right: 24,
                zIndex: 1000
              }}
            >
              <AddIcon />
            </Fab>
          </>
        )}


      </Paper>

      {/* Dialogs */}
      <ShoppingListItemEditDialog
        open={itemDialogOpen}
        onClose={() => {
          setItemDialogOpen(false);
          setEditingItem(undefined);
        }}
        listId={selectedList?.id || ''}
        item={editingItem}
        onSaved={() => {
          setItemDialogOpen(false);
          setEditingItem(undefined);
        }}
      />

      <ManageShoppingListsDialog
        open={manageDialogOpen}
        onClose={() => setManageDialogOpen(false)}
        lists={shoppingLists}
        onListDeleted={handleListDeleted}
      />
    </Container>
  );
};

export default ShoppingListPage;
