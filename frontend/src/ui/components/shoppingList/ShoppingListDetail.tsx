import React, { useState } from 'react';
import {
  Box,
  Typography,
  Fab,
  IconButton,
  LinearProgress,
  Divider
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import AddIcon from '@mui/icons-material/Add';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useShoppingList } from '../../hooks/useShoppingLists';
import { useShoppingListItems } from '../../hooks/useShoppingListItems';
import { useShoppingListItemActions } from '../../hooks/useShoppingListItemActions';
import { ShoppingListItemCard } from './ShoppingListItemCard';
import { ShoppingListItemEditDialog } from './ShoppingListItemEditDialog';
import { ShoppingListItemDocType } from '../../../types/dbCollections';

interface ShoppingListDetailProps {
  listId: string;
  onBack?: () => void;
}

export const ShoppingListDetail: React.FC<ShoppingListDetailProps> = ({ listId, onBack }) => {
  const { t } = useTranslation();
  const { shoppingList } = useShoppingList(listId);
  const { shoppingListItems, stats } = useShoppingListItems(listId);
  const { toggleShoppingListItemCompleted, deleteShoppingListItem } = useShoppingListItemActions();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ShoppingListItemDocType | undefined>();

  const completionPercentage = stats.total > 0 ? (stats.completed / stats.total) * 100 : 0;

  const handleAddItem = () => {
    setEditingItem(undefined);
    setDialogOpen(true);
  };

  const handleEditItem = (item: ShoppingListItemDocType) => {
    setEditingItem(item);
    setDialogOpen(true);
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
    <Box>
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        {onBack && (
          <IconButton onClick={onBack} aria-label={t('common.back')}>
            <ArrowBackIcon />
          </IconButton>
        )}
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h5" component="h1">
            {shoppingList?.name || t('shoppingList.list')}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t('shoppingList.itemCount', { count: stats.total })}
          </Typography>
        </Box>
      </Box>

      {stats.total > 0 && (
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2" color="text.secondary">
              {t('shoppingList.progress')}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {stats.completed} / {stats.total} ({Math.round(completionPercentage)}%)
            </Typography>
          </Box>
          <LinearProgress 
            variant="determinate" 
            value={completionPercentage} 
            sx={{ height: 8, borderRadius: 4 }}
          />
        </Box>
      )}

      <Divider sx={{ mb: 2 }} />

      {shoppingListItems.length === 0 ? (
        <Typography align="center" color="text.secondary" sx={{ my: 4 }}>
          {t('shoppingList.emptyList')}
        </Typography>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {shoppingListItems.map((item) => (
            <ShoppingListItemCard
              key={item.id}
              item={item}
              onToggleComplete={() => handleToggleComplete(item.id)}
              onEdit={() => handleEditItem(item)}
              onDelete={() => handleDeleteItem(item.id)}
            />
          ))}
        </Box>
      )}

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

      <ShoppingListItemEditDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        listId={listId}
        item={editingItem}
        onSaved={() => setDialogOpen(false)}
      />
    </Box>
  );
};
