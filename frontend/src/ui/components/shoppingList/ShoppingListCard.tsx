import React from 'react';
import { Card, CardContent, Typography, Box, IconButton, Chip } from '@mui/material';
import { useTranslation } from 'react-i18next';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { ShoppingListDocType } from '../../../types/dbCollections';
import { useShoppingListItems } from '../../hooks/useShoppingListItems';

interface ShoppingListCardProps {
  list: ShoppingListDocType;
  onClick?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export const ShoppingListCard: React.FC<ShoppingListCardProps> = ({ 
  list, 
  onClick, 
  onEdit, 
  onDelete 
}) => {
  const { t } = useTranslation();
  const { stats } = useShoppingListItems(list.id);

  return (
    <Card 
      sx={{ 
        cursor: onClick ? 'pointer' : 'default',
        '&:hover': onClick ? { boxShadow: 4 } : {},
        transition: 'box-shadow 0.2s'
      }}
      onClick={onClick}
    >
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexGrow: 1 }}>
            <ShoppingCartIcon color="primary" />
            <Typography variant="h6" component="div">
              {list.name}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            {onEdit && (
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                }}
                aria-label={t('aria.edit')}
              >
                <EditIcon fontSize="small" />
              </IconButton>
            )}
            {onDelete && (
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                aria-label={t('aria.delete')}
                color="error"
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            )}
          </Box>
        </Box>

        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Chip 
            label={`${stats.total} ${t('shoppingList.items')}`}
            size="small"
            variant="outlined"
          />
          {stats.completed > 0 && (
            <Chip 
              label={`${stats.completed} ${t('shoppingList.completed')}`}
              size="small"
              color="success"
              variant="outlined"
            />
          )}
        </Box>

        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
          {t('common.created')}: {new Date(list.created_at || '').toLocaleDateString()}
        </Typography>
      </CardContent>
    </Card>
  );
};
