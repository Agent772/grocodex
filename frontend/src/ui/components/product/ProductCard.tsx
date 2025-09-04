import React from 'react';
import { Card, Box, Typography, Chip, Avatar, CircularProgress, IconButton } from '@mui/material';
import { useProductGroupDetails } from '../../hooks/useProductGroupDetails';
import { useTranslation } from 'react-i18next';
import EditIcon from '@mui/icons-material/Edit';

export interface ProductCardProps {
  productGroupId: string;
  onEditGroup?: (groupId: string) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ productGroupId, onEditGroup }) => {
  const { productGroup, products, loading, error } = useProductGroupDetails(productGroupId);
  const { t } = useTranslation();

  if (loading) return <Box sx={{ p: 2, textAlign: 'center' }}><CircularProgress size={24} /></Box>;
  if (error || !productGroup) return <Box sx={{ p: 2, color: 'error.main' }}>{t('productCard.error', 'Error loading product group')}</Box>;

  return (
    <Card sx={{ position: 'relative', display: 'flex', flexDirection: 'column', p: 2, borderRadius: 2, boxShadow: 2, width: '100%' }}>
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
      <Box sx={{ mt: 1 }}>
        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>{t('productCard.products', 'Products:')}</Typography>
        {products.length === 0 ? (
          <Typography variant="body2" color="text.secondary">{t('productCard.noProducts', 'No products in this group')}</Typography>
        ) : (
          products.map(product => (
            <Box key={product.id} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Avatar src={product.image_url} sx={{ mr: 1, width: 32, height: 32 }} />
              <Typography variant="body1" sx={{ flexGrow: 1 }}>{product.name}</Typography>
              <Chip label={product.unit || ''} size="small" sx={{ ml: 1 }} />
              {product.quantity !== undefined && (
                <Typography variant="body2" sx={{ ml: 2 }}>{product.quantity}</Typography>
              )}
            </Box>
          ))
        )}
      </Box>
    </Card>
  );
};

export default ProductCard;
