import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  IconButton,
  Checkbox,
  Chip
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { ShoppingListItemDocType } from '../../../types/dbCollections';

interface ShoppingListItemCardProps {
  item: ShoppingListItemDocType;
  onToggleComplete?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export const ShoppingListItemCard: React.FC<ShoppingListItemCardProps> = ({
  item,
  onToggleComplete,
  onEdit,
  onDelete
}) => {
  const { t } = useTranslation();

  return (
    <Card
      sx={{
        opacity: item.completed ? 0.6 : 1,
        transition: 'opacity 0.2s'
      }}
    >
      <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Checkbox
            checked={item.completed}
            onChange={onToggleComplete}
            sx={{ p: 0.5 }}
          />

          <Box sx={{ flexGrow: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography
              variant="body1"
              sx={{
                textDecoration: item.completed ? 'line-through' : 'none',
                fontWeight: item.completed ? 'normal' : 'medium',
                flexShrink: 0
              }}
            >
              {item.name}
            </Typography>
            <Chip
              label={`${item.quantity} ${item.unit}`}
              size="small"
              variant="outlined"
              sx={{ height: '20px', flexShrink: 0 }}
            />
            {item.count > 1 && (
              <Chip
                label={`×${item.count}`}
                size="small"
                sx={{ 
                  height: '20px', 
                  flexShrink: 0,
                  bgcolor: 'primary.main',
                  color: 'primary.contrastText',
                  fontWeight: 'bold'
                }}
              />
            )}
            {item.comment && (
              <Typography 
                variant="caption" 
                color="text.secondary" 
                sx={{ 
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  flexShrink: 1,
                  minWidth: 0
                }}
              >
                {item.comment}
              </Typography>
            )}
          </Box>

          <Box sx={{ display: 'flex', gap: 0.5, flexShrink: 0 }}>
            {onEdit && (
              <IconButton
                size="small"
                onClick={onEdit}
                aria-label={t('aria.edit')}
              >
                <EditIcon fontSize="small" />
              </IconButton>
            )}
            {onDelete && (
              <IconButton
                size="small"
                onClick={onDelete}
                aria-label={t('aria.delete')}
                color="error"
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};
