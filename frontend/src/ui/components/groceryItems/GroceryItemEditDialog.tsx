import React, { useState, useEffect } from 'react';
import { useSwipeable } from 'react-swipeable';
import { useRxDB } from 'rxdb-hooks';
import { Fab, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Box, IconButton, Autocomplete, InputAdornment, Typography, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { ContainerBreadcrumbLabel, getContainerBreadcrumbLabel } from '../containers/ContainerBreadcrumbLabel';
import { useContainerSearch } from '../../hooks/useContainerSearch';
import { Save as SaveIcon, Close as CloseIcon } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useGroceryItemActions } from '../../hooks/useGroceryItemActions';
import { GroceryItemDocType, ContainerDocType } from '../../../types/dbCollections';
import { ProductDocType, ProductGroupDocType } from '../../../types/dbCollections';
import { getUnitLabel } from '../../utils/getUnitLabel';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';

interface GroceryItemEditDialogProps {
  open: boolean;
  groceryItems: GroceryItemDocType[];
  initialIndex?: number;
  onClose: () => void;
  onSaved?: () => void;
}

const GroceryItemEditDialog: React.FC<GroceryItemEditDialogProps> = ({ open, groceryItems, initialIndex = 0, onClose, onSaved }) => {
  const db = useRxDB();
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const groceryItem = groceryItems[currentIndex];
  const [container, setContainer] = useState<ContainerDocType | null>(null);
  const [productGroup, setProductGroup] = useState<ProductGroupDocType | null>(null);
  const { containers: containerOptions } = useContainerSearch();
  const { t } = useTranslation();
  const [manualFields, setManualFields] = useState({ productBrand: '', unit: '', quantity: '', buyDate: '', expirationDate: '', notes: '' });
  const [barcode, setBarcode] = useState('');
  const [productName, setProductName] = useState('');
  const { updateGroceryItem } = useGroceryItemActions();

 // Swipe handlers for mobile
  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => {
      if (groceryItems.length > 1) handleNext();
    },
    onSwipedRight: () => {
      if (groceryItems.length > 1) handlePrev();
    },
    trackMouse: false,
  });

  useEffect(() => {
    if (!open) {
      setProductName('');
      setBarcode('');
      setManualFields({ productBrand: '', unit: '', quantity: '', buyDate: '', expirationDate: '', notes: '' });
      setContainer(null);
      setProductGroup(null);
      setCurrentIndex(initialIndex);
    } else if (groceryItem) {
      (async () => {
        let product: ProductDocType | null = null;
        if (groceryItem.product_id && db && db.collections.product) {
          const doc = await db.collections.product.findOne({ selector: { id: groceryItem.product_id } }).exec();
          product = doc ? doc.toJSON() as ProductDocType : null;
        }
        setProductName(product?.name || '');
        setBarcode(product?.barcode || '');
        setManualFields({
          productBrand: product?.brand || '',
          unit: product?.unit || '',
          quantity: groceryItem.rest_quantity ? String(groceryItem.rest_quantity) : '',
          buyDate: groceryItem.buy_date || '',
          expirationDate: groceryItem.expiration_date || '',
          notes: groceryItem.notes || ''
        });
        setContainer(groceryItem.container_id ? containerOptions.find(c => c.id === groceryItem.container_id) || null : null);
        // Load product group for info
        if (product?.product_group_id && db && db.collections.product_group) {
          const doc = await db.collections.product_group.findOne({ selector: { id: product.product_group_id } }).exec();
          setProductGroup(doc ? doc.toJSON() as ProductGroupDocType : null);
        } else {
          setProductGroup(null);
        }
      })();
    }
  }, [open, groceryItem, containerOptions, db, initialIndex]);

  // When currentIndex changes, update fields for the new item
  useEffect(() => {
    if (groceryItem) {
      (async () => {
        let product: ProductDocType | null = null;
        if (groceryItem.product_id && db && db.collections.product) {
          const doc = await db.collections.product.findOne({ selector: { id: groceryItem.product_id } }).exec();
          product = doc ? doc.toJSON() as ProductDocType : null;
        }
        setProductName(product?.name || '');
        setBarcode(product?.barcode || '');
        setManualFields({
          productBrand: product?.brand || '',
          unit: product?.unit || '',
          quantity: groceryItem.rest_quantity ? String(groceryItem.rest_quantity) : '',
          buyDate: groceryItem.buy_date || '',
          expirationDate: groceryItem.expiration_date || '',
          notes: groceryItem.notes || ''
        });
        setContainer(groceryItem.container_id ? containerOptions.find(c => c.id === groceryItem.container_id) || null : null);
        // Load product group for info
        if (product?.product_group_id && db && db.collections.product_group) {
          const doc = await db.collections.product_group.findOne({ selector: { id: product.product_group_id } }).exec();
          setProductGroup(doc ? doc.toJSON() as ProductGroupDocType : null);
        } else {
          setProductGroup(null);
        }
      })();
    }
  }, [currentIndex]);

  const handleManualFieldChange = (field: string, value: string) => {
    setManualFields(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    // Update only editable fields
    const updatedFields: Partial<GroceryItemDocType> = {
      rest_quantity: manualFields.quantity ? Number(manualFields.quantity) : groceryItem.rest_quantity,
      buy_date: manualFields.buyDate || groceryItem.buy_date,
      expiration_date: manualFields.expirationDate || groceryItem.expiration_date,
      notes: manualFields.notes || groceryItem.notes,
      container_id: container ? container.id : groceryItem.container_id,
      updated_at: new Date().toISOString(),
    };
    await updateGroceryItem(groceryItem.id, updatedFields);
    if (onSaved) onSaved();
    onClose();
  };

  const handleCancel = () => {
    onClose();
  };

  const handlePrev = () => {
    setCurrentIndex(idx => (idx > 0 ? idx - 1 : groceryItems.length - 1));
  };
  const handleNext = () => {
    setCurrentIndex(idx => (idx < groceryItems.length - 1 ? idx + 1 : 0));
  };

  return (
    <>
      {/* Overlay chevrons for navigation - only show on desktop */}
      {groceryItems.length > 1 && isDesktop && open && (
        <Box
          sx={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 1301,
            pointerEvents: 'none',
            width: '100vw',
            height: '100vh',
          }}
        >
          {/* Left chevron */}
          <Box
            sx={{
              position: 'absolute',
              left: 'calc(50% - 340px)',
              top: '50%',
              transform: 'translateY(-50%)',
              pointerEvents: 'auto',
            }}
          >
            <IconButton
              onClick={handlePrev}
              size="large"
              aria-label={t('aria.prev', 'Previous')}
              sx={{
                backgroundColor: 'transparent',
                transition: 'background-color 0.2s',
                '&:hover': {
                  backgroundColor: 'transparent',
                },
                '& .MuiSvgIcon-root': {
                  transition: 'transform 0.2s',
                },
                '&:hover .MuiSvgIcon-root': {
                  transform: 'scale(1.3)',
                },
              }}
            >
              <ArrowBackIosIcon />
            </IconButton>
          </Box>
          {/* Right chevron */}
          <Box
            sx={{
              position: 'absolute',
              right: 'calc(50% - 340px)',
              top: '50%',
              transform: 'translateY(-50%)',
              pointerEvents: 'auto',
            }}
          >
            <IconButton
              onClick={handleNext}
              size="large"
              aria-label={t('aria.next', 'Next')}
              sx={{
                backgroundColor: 'transparent',
                transition: 'background-color 0.2s',
                '&:hover': {
                  backgroundColor: 'transparent',
                },
                '& .MuiSvgIcon-root': {
                  transition: 'transform 0.2s',
                },
                '&:hover .MuiSvgIcon-root': {
                  transform: 'scale(1.3)',
                },
              }}
            >
              <ArrowForwardIosIcon />
            </IconButton>
          </Box>
        </Box>
      )}
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          {t('groceryItem.edit.title', 'Edit Grocery Item')}
          {groceryItems.length > 1 && (
            <Box display="inline-flex" alignItems="center" ml={2}>
              <IconButton onClick={handlePrev} disabled={currentIndex === 0} size="small" aria-label={t('aria.prev', 'Previous')}>
                {'<'}
              </IconButton>
              <Typography variant="caption" sx={{ mx: 1 }}>{currentIndex + 1} / {groceryItems.length}</Typography>
              <IconButton onClick={handleNext} disabled={currentIndex === groceryItems.length - 1} size="small" aria-label={t('aria.next', 'Next')}>
                {'>'}
              </IconButton>
            </Box>
          )}
        </DialogTitle>
        <DialogContent sx={{ pb: 1 }}>
          <Box display="flex" flexDirection="column" gap={1} mt={2} {...(!isDesktop ? swipeHandlers : {})}>
            <TextField
              label={t('productGroup.label', 'Product Group')}
              value={productGroup?.name || ''}
              fullWidth
              disabled
              sx={{ mb: 1 }}
            />
            <TextField
              label={t('groceryItem.product', 'Product')}
              value={productName}
              fullWidth
              autoFocus
              disabled
            />
            <TextField
              label={t('product.barcode', 'Barcode')}
              value={barcode}
              fullWidth
              disabled
            />
            <TextField
              label={t('product.brand', 'Brand')}
              value={manualFields.productBrand}
              fullWidth
              disabled
            />
            <Box display="flex" alignItems="center" gap={1}>
              <TextField
                label={t('groceryItem.remainingQuantity', 'Remaining Quantity')}
                value={manualFields.quantity}
                onChange={e => handleManualFieldChange('quantity', e.target.value)}
                fullWidth
                required
                type="number"
                slotProps={{
                  htmlInput: {
                    min: 0,
                  },
                  input: {
                    endAdornment: 
                      <InputAdornment position="end">
                        {manualFields.unit ? getUnitLabel(manualFields.unit, t) : ''}
                      </InputAdornment>
                  }
                }}
                sx={{ width: { xs: '40vw', sm: '45vw' } }}
              />
              <TextField
                label={t('groceryItem.quantity', 'Quantity')}
                value={groceryItem.rest_quantity ? groceryItem.rest_quantity : ''}
                fullWidth
                disabled
                slotProps={{
                  input: {
                    endAdornment: 
                      <InputAdornment position="end">
                        {manualFields.unit ? getUnitLabel(manualFields.unit, t) : ''}
                      </InputAdornment>
                  }
                }}
                sx={{ width: { xs: '35vw', sm: '40vw' } }}
              />
            </Box>
            <Box display="flex" alignItems="center" gap={1}>
              <TextField
                label={t('groceryItem.buyDate', 'Buy Date')}
                type="date"
                value={manualFields.buyDate || new Date().toISOString().slice(0, 10)}
                onChange={e => handleManualFieldChange('buyDate', e.target.value)}
                slotProps= {{
                  inputLabel: {
                    shrink: true,
                  }
                }}
                fullWidth
              />
              <TextField
                label={t('groceryItem.expirationDate', 'Expiration Date')}
                type="date"
                value={manualFields.expirationDate}
                onChange={e => handleManualFieldChange('expirationDate', e.target.value)}
                slotProps= {{
                  inputLabel: {
                    shrink: true,
                  }
                }}
                fullWidth
              />
            </Box>
            <TextField
              label={t('groceryItem.notes', 'Notes')}
              value={manualFields.notes}
              onChange={e => handleManualFieldChange('notes', e.target.value)}
              fullWidth
            />
            {/* Container autocomplete field */}
            <Autocomplete
              options={containerOptions}
              getOptionLabel={option => getContainerBreadcrumbLabel(option, containerOptions, t)}
              value={container}
              onChange={(_, value) => setContainer(value)}
              renderOption={(props, option) => (
                <li {...props}>
                  <ContainerBreadcrumbLabel container={option} containerOptions={containerOptions} />
                </li>
              )}
              renderInput={params => (
                <TextField
                  {...params}
                  label={t('groceryItem.container', 'Container / Location')}
                  fullWidth
                />
              )}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              sx={{ mt: 2 }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <IconButton onClick={handleCancel} size="small" color="inherit" aria-label={t('aria.cancel', 'Cancel')}>
            <CloseIcon />
          </IconButton>
          <Fab
            color="primary"
            aria-label={t('aria.save', 'Save')}
            onClick={handleSave}
            size="small"
          >
            <SaveIcon />
          </Fab>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default GroceryItemEditDialog;
