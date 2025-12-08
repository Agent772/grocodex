import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItem,
  ListItemText,
  IconButton,
  TextField,
  Box,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import { ShoppingListDocType } from '../../../types/dbCollections';
import { useShoppingListActions } from '../../hooks/useShoppingListActions';

interface ManageShoppingListsDialogProps {
  open: boolean;
  onClose: () => void;
  lists: ShoppingListDocType[];
  onListDeleted?: (listId: string) => void;
}

interface ManageListItemProps {
  list: ShoppingListDocType;
  onDelete: () => void;
}

const ManageListItem: React.FC<ManageListItemProps> = ({ list, onDelete }) => {
  const { t } = useTranslation();
  const { updateShoppingList } = useShoppingListActions();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(list.name);

  const handleSave = async () => {
    if (name.trim() && name !== list.name) {
      try {
        await updateShoppingList(list.id, { name: name.trim() });
      } catch (error) {
        console.error('Error updating list name:', error);
      }
    }
    setIsEditing(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      setName(list.name);
      setIsEditing(false);
    }
  };

  return (
    <ListItem
      sx={{
        border: 1,
        borderColor: 'divider',
        borderRadius: 1,
        mb: 1,
        '&:hover': {
          backgroundColor: 'action.hover'
        }
      }}
    >
      {isEditing ? (
        <TextField
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={handleSave}
          onKeyDown={handleKeyPress}
          autoFocus
          fullWidth
          size="small"
          variant="outlined"
        />
      ) : (
        <ListItemText 
          primary={list.name}
          onClick={() => setIsEditing(true)}
          sx={{ cursor: 'pointer' }}
        />
      )}
      <IconButton
        edge="end"
        aria-label={t('aria.delete')}
        onClick={onDelete}
        color="error"
        sx={{ ml: 1 }}
      >
        <DeleteIcon />
      </IconButton>
    </ListItem>
  );
};

export const ManageShoppingListsDialog: React.FC<ManageShoppingListsDialogProps> = ({
  open,
  onClose,
  lists,
  onListDeleted
}) => {
  const { t } = useTranslation();
  const { deleteShoppingList } = useShoppingListActions();

  const handleDelete = async (listId: string) => {
    if (window.confirm(t('shoppingList.confirmDelete'))) {
      try {
        await deleteShoppingList(listId);
        if (onListDeleted) {
          onListDeleted(listId);
        }
      } catch (error) {
        console.error('Error deleting shopping list:', error);
      }
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {t('shoppingList.manageLists')}
          <IconButton
            edge="end"
            onClick={onClose}
            aria-label={t('aria.close')}
            size="small"
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        <List sx={{ pt: 2 }}>
          {lists.map((list) => (
            <ManageListItem
              key={list.id}
              list={list}
              onDelete={() => handleDelete(list.id)}
            />
          ))}
        </List>
      </DialogContent>
    </Dialog>
  );
};
