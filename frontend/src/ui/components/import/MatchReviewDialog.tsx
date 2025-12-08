import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Typography,
  Box,
  Chip,
  Divider,
  Radio,
  Alert,
  Autocomplete,
  TextField,
} from '@mui/material';
import {
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useRxDB } from 'rxdb-hooks';
import { MatchResult } from '../../../types/importMatching';
import { ProductDocType } from '../../../types/dbCollections';

interface MatchReviewDialogProps {
  open: boolean;
  matchResult: MatchResult | null;
  onClose: () => void;
  onConfirm: (result: MatchResult, selectedProduct?: ProductDocType) => void;
  renderInDialog?: boolean;
  onChange?: (result: MatchResult, selectedProduct: ProductDocType | null) => void;
}

/**
 * Dialog for reviewing and validating ambiguous or low-confidence matches
 * Allows user to select from suggestions or skip the item
 */
const MatchReviewDialog: React.FC<MatchReviewDialogProps> = ({
  open,
  matchResult,
  onClose,
  onConfirm,
  renderInDialog = true,
  onChange,
}) => {
  const { t } = useTranslation();
  const db = useRxDB();
  const [selectedProduct, setSelectedProduct] = useState<ProductDocType | null>(null);
  const [allProducts, setAllProducts] = useState<ProductDocType[]>([]);

  // Load all products from DB
  useEffect(() => {
    const loadProducts = async () => {
      if (!db) return;
      const productDocs = await db.collections.product.find().exec();
      const products = productDocs.map((doc: any) => doc.toJSON());
      setAllProducts(products);
    };
    loadProducts();
  }, [db]);

  // Set selected product to matched product when dialog opens
  useEffect(() => {
    if (matchResult?.matchedProduct) {
      setSelectedProduct(matchResult.matchedProduct);
    } else {
      setSelectedProduct(null);
    }
  }, [matchResult]);

  // Notify parent of changes when embedded
  useEffect(() => {
    if (!renderInDialog && onChange && matchResult) {
      onChange(matchResult, selectedProduct);
    }
  }, [selectedProduct, renderInDialog, onChange, matchResult]);

  if (!matchResult) return null;

  const { parsedItem, matchedProduct, suggestions, confidence, matchType } = matchResult;

  // Build list of options (matched product + suggestions)
  const options: ProductDocType[] = [];
  if (matchedProduct) {
    options.push(matchedProduct);
  }
  if (suggestions && suggestions.length > 0) {
    options.push(...suggestions.filter(s => s.id !== matchedProduct?.id));
  }

  const handleConfirm = () => {
    onConfirm(matchResult, selectedProduct || undefined);
    setSelectedProduct(null);
    onClose();
  };

  const handleCancel = () => {
    setSelectedProduct(null);
    onClose();
  };

  const content = (
    <>
      {renderInDialog && (
        <DialogTitle>
          {t('import.reviewMatch', 'Review Match')}
        </DialogTitle>
      )}

      <DialogContent sx={{ pt: renderInDialog ? 2 : 1 }}>
        {/* Parsed Item Info - Enhanced */}
        <Box sx={{ mb: 3, p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            {t('import.parsedItem', 'From Shopping List')}
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {parsedItem.name}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              {parsedItem.quantity && (
                <>
                  <Chip
                    label={`${parsedItem.quantity} ${parsedItem.unit || 'pcs'}`}
                    size="small"
                    color="primary"
                    variant="filled"
                  />
                  {parsedItem.quantityMin !== undefined && parsedItem.quantityMax !== undefined && (
                    <Typography variant="caption" color="text.secondary">
                      (Range: {parsedItem.quantityMin} - {parsedItem.quantityMax})
                    </Typography>
                  )}
                </>
              )}
            </Box>
            {parsedItem.category && (
              <Typography variant="caption" color="text.secondary">
                Category: {parsedItem.category}
              </Typography>
            )}
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Product Search & Selection */}
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          {t('import.selectProduct', 'Select Matching Product')}
        </Typography>

        <Autocomplete
          options={[...allProducts]}
          value={selectedProduct}
          onChange={(_, newValue) => setSelectedProduct(newValue)}
          getOptionLabel={(option) => option ? `${option.name} - ${option.quantity} ${option.unit}` : t('import.noMatch', 'No match')}
          renderOption={(props, option) => {
            const isMatched = matchedProduct?.id === option.id;
            return (
              <Box component="li" {...props}>
                <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body1">
                      {option.name}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {option.quantity} {option.unit}
                    {option.brand && ` • ${option.brand}`}
                  </Typography>
                </Box>
              </Box>
            );
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              placeholder={t('import.searchOrSelectNoMatch', 'Search products or leave empty for no match...')}
              variant="outlined"
            />
          )}
          clearOnEscape
          sx={{ mb: 2 }}
        />

      </DialogContent>

      {renderInDialog && (
        <DialogActions>
        <Button onClick={handleCancel} color="inherit">
          {t('common.cancel', 'Cancel')}
        </Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          color="primary"
          disabled={!selectedProduct}
        >
          {t('import.confirmMatch', 'Confirm Match')}
        </Button>
        </DialogActions>
      )}

    </>
  );

  return renderInDialog ? (
    <Dialog open={open} onClose={handleCancel} maxWidth="sm" fullWidth>
      {content}
    </Dialog>
  ) : (
    content
  );
};

export default MatchReviewDialog;
