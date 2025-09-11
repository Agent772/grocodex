import React, { useState } from 'react';
import { Card, Box, Typography, Chip, Avatar, CircularProgress, IconButton, Collapse, List, ListItem, ListItemAvatar, ListItemText } from '@mui/material';
import { useProductGroupDetails } from '../../hooks/useProductGroupDetails';
import { useTranslation } from 'react-i18next';
import { getUnitLabel } from '../../utils/getUnitLabel';
import EditIcon from '@mui/icons-material/Edit';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

export interface ProductCardProps {
  productGroupId: string;
  expanded: boolean;
  onToggleExpanded: () => void;
  onEditGroup?: (groupId: string) => void;
  onEditProduct?: (productId: string) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ productGroupId, expanded, onToggleExpanded, onEditGroup, onEditProduct }) => {
  const { productGroup, products, loading, error } = useProductGroupDetails(productGroupId);
  const { t } = useTranslation();
  // expanded and onToggleExpanded are now props from parent

  if (loading) return <Box sx={{ p: 2, textAlign: 'center' }}><CircularProgress size={24} /></Box>;
  if (error || !productGroup) return <Box sx={{ p: 2, color: 'error.main' }}>{t('productCard.error', 'Error loading product group')}</Box>;

  // Show up to 5 products, enable virtual scroll if more
  const maxVisible = 5;
  const visibleProducts = expanded ? products.slice(0, maxVisible) : [];
  const hasMore = products.length > maxVisible;

  // Handler for editing a product (calls parent handler)
  const handleEditProduct = (productId: string) => {
    if (typeof onEditProduct === 'function') onEditProduct(productId);
  };

  return (
    <Card
      sx={{ position: 'relative', display: 'flex', flexDirection: 'column', p: 2, borderRadius: 2, boxShadow: 2,  cursor: 'pointer' }}
    >
      {/* Edit button at top right */}
      {onEditGroup && (
        <IconButton
          aria-label={t('aria.edit', 'Edit')}
          size="small"
          sx={{ position: 'absolute', top: 8, right: 8, zIndex: 2 }}
          onClick={e => { e.stopPropagation(); onEditGroup(productGroup.id); }}
        >
          <EditIcon />
        </IconButton>
      )}
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Avatar src={products[0]?.image_url} sx={{ mr: 2 }} />
        <Typography variant="h6" sx={{ flexGrow: 1 }}>{productGroup.name || t('productCard.unknownGroup', 'Unknown Group')}</Typography>
      </Box>
      {/* Summary row: Products count and expand/collapse, only if products exist */}
      {products.length > 0 ? (
        <Box
          sx={{ display: 'flex', alignItems: 'center', mt: 1, cursor: 'pointer', userSelect: 'none' }}
          onClick={e => { e.stopPropagation(); onToggleExpanded(); }}
          aria-label={t('productCard.aria.showProducts', 'Show products')}
        >
          <IconButton
            size="small"
            onClick={e => { e.stopPropagation(); onToggleExpanded(); }}
            aria-label={t('productCard.aria.showProducts', 'Show products')}
            sx={{ p: 0, mr: 1 }}
          >
            {expanded ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
          </IconButton>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ flexGrow: 1, textAlign: 'left' }}
          >
            {t('productCard.associated_products', 'Products:')}
          </Typography>
          <Chip label={products.length} size="small" sx={{ ml: 1 }} />
        </Box>
      ) : (
        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, justifyContent: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            {t('productCard.noProducts', 'No products in this group')}
          </Typography>
        </Box>
      )}
      {/* Expandable product list with max height and scroll */}
      <Collapse in={expanded} timeout="auto" unmountOnExit>
      <Box sx={{ mt: 2, maxHeight: 220, overflowY: 'auto' }}>
        <List sx={{ p: 0 }}>
          {visibleProducts.map(product => (
            <ListItem key={product.id} sx={{ py: 0.25, minHeight: 28, alignItems: 'center' }}>
              <ListItemText
                primary={product.name}
                sx={{ m: 0 }}
              />
              {product.quantity !== undefined && (
                <Box sx={{ display: 'flex', alignItems: 'center', m: 0 }}>
                  <Typography variant="body2" sx={{ ml: 1, fontSize: '0.95rem', p: 0 }}>{product.quantity}</Typography>
                  <Chip label={product.unit ? getUnitLabel(product.unit, t) : ''} size="small" sx={{ ml: 1, height: 22, fontSize: '0.8rem', p: 0 }} />
                </Box>
              )}
              {/* Edit product button */}
              <IconButton
                aria-label={t('productCard.aria.editProduct', 'Edit product')}
                size="small"
                sx={{ ml: 1 }}
                onClick={e => { e.stopPropagation(); handleEditProduct(product.id); }}
              >
                <EditIcon fontSize="small" />
              </IconButton>
            </ListItem>
          ))}
          {hasMore && (
            <ListItem sx={{ justifyContent: 'center', py: 0.5, minHeight: 36 }}>
              <Typography variant="body2" color="text.secondary">
                {t('productCard.moreProducts', 'More products available...')}
              </Typography>
            </ListItem>
          )}
        </List>
      </Box>
      </Collapse>
    </Card>
  );
};

export default ProductCard;
