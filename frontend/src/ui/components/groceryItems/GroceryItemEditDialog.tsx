import React, { useState, useEffect } from 'react';
import { useRxDB } from '../../../db/RxDBProvider';
import { Fab, Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Box, MenuItem, IconButton, Autocomplete } from '@mui/material';
import { ContainerBreadcrumbLabel, getContainerBreadcrumbLabel } from '../containers/ContainerBreadcrumbLabel';
import { useContainerSearch } from '../../hooks/useContainerSearch';
import { Save as SaveIcon, QrCodeScanner as QrCodeScannerIcon, Close as CloseIcon } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { UI_TRANSLATION_KEYS } from '../../../types/uiTranslationKeys';
import { UNIT_OPTIONS } from '../../../types/unitOptions';
import { useGroceryItemActions } from '../../hooks/useGroceryItemActions';
import { GroceryItemDocType, ContainerDocType } from '../../../types/dbCollections';
import { ProductDocType, ProductGroupDocType } from '../../../types/dbCollections';

interface GroceryItemEditDialogProps {
  open: boolean;
  groceryItem: GroceryItemDocType;
  onClose: () => void;
  onSaved?: () => void;
}

const GroceryItemEditDialog: React.FC<GroceryItemEditDialogProps> = ({ open, groceryItem, onClose, onSaved }) => {
  const db = useRxDB();
  const [container, setContainer] = useState<ContainerDocType | null>(null);
  const { containers: containerOptions } = useContainerSearch();
  const { t } = useTranslation();
  const [manualFields, setManualFields] = useState({ productBrand: '', unit: '', quantity: '', buyDate: '', expirationDate: '', notes: '' });
  const [barcode, setBarcode] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const { updateGroceryItem } = useGroceryItemActions();

  useEffect(() => {
    if (!open) {
      setName('');
      setBarcode('');
      setManualFields({ productBrand: '', unit: '', quantity: '', buyDate: '', expirationDate: '', notes: '' });
      setContainer(null);
    } else if (groceryItem) {
      (async () => {
        let product: ProductDocType | null = null;
        if (groceryItem.product_id && db && db.collections.product) {
          const doc = await db.collections.product.findOne({ selector: { id: groceryItem.product_id } }).exec();
          product = doc ? doc.toJSON() as ProductDocType : null;
        }
        setName(product?.name || '');
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
      })();
    }
  }, [open, groceryItem, containerOptions, db]);

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

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{t(UI_TRANSLATION_KEYS.GROCERY_ADD_TITLE, 'Edit Grocery Item')}</DialogTitle>
      <DialogContent sx={{ pb: 1 }}>
        <Box display="flex" flexDirection="column" gap={1} mt={2}>
          <TextField
            label={t(UI_TRANSLATION_KEYS.GROCERY_NAME, 'Name')}
            value={name}
            fullWidth
            autoFocus
            disabled
          />
          <TextField
            label={t(UI_TRANSLATION_KEYS.GROCERY_BARCODE, 'Barcode')}
            value={barcode}
            fullWidth
            disabled
          />
          <TextField
            label={t(UI_TRANSLATION_KEYS.GROCERY_BRAND, 'Brand')}
            value={manualFields.productBrand}
            fullWidth
            disabled
          />
          <Box display="flex" alignItems="center" gap={1}>
            <TextField
              label={t(UI_TRANSLATION_KEYS.GROCERY_REMAINING_QTY ?? 'Remaining Quantity')}
              value={manualFields.quantity}
              onChange={e => handleManualFieldChange('quantity', e.target.value)}
              fullWidth
              type="number"
              inputProps={{ min: 0 }}
              sx={{ width: { xs: '60vw', sm: '60vw' } }}
            />
            <TextField
              label={t(UI_TRANSLATION_KEYS.GROCERY_QUANTITY, 'Quantity')}
              value={groceryItem.rest_quantity ? groceryItem.rest_quantity : ''}
              fullWidth
              disabled
              sx={{ width: { xs: '40vw', sm: '40vw' } }}
            />
            <TextField
              select
              label={t(UI_TRANSLATION_KEYS.GROCERY_UNIT, 'Unit')}
              value={manualFields.unit}
              sx={{ width: { xs: '25vw', sm: '10vw' } }}
              disabled
            >
              {UNIT_OPTIONS.map(opt => (
                <MenuItem key={opt} value={opt}>{opt}</MenuItem>
              ))}
            </TextField>
          </Box>
          <Box display="flex" alignItems="center" gap={1}>
            <TextField
              label={t(UI_TRANSLATION_KEYS.GROCERY_BUY_DATE, 'Buy Date')}
              type="date"
              value={manualFields.buyDate || new Date().toISOString().slice(0, 10)}
              onChange={e => handleManualFieldChange('buyDate', e.target.value)}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
            <TextField
              label={t(UI_TRANSLATION_KEYS.GROCERY_EXPIRATION_DATE, 'Expiration Date (optional)')}
              type="date"
              value={manualFields.expirationDate}
              onChange={e => handleManualFieldChange('expirationDate', e.target.value)}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
          </Box>
          <TextField
            label={t(UI_TRANSLATION_KEYS.GROCERY_NOTES, 'Notes')}
            value={manualFields.notes}
            onChange={e => handleManualFieldChange('notes', e.target.value)}
            fullWidth
          />
          {/* Container autocomplete field */}
          <Autocomplete
            options={containerOptions}
            getOptionLabel={option => getContainerBreadcrumbLabel(option, containerOptions)}
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
                label={t(UI_TRANSLATION_KEYS.GROCERY_CONTAINER, 'Container / Location')}
                fullWidth
              />
            )}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            sx={{ mt: 2 }}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <IconButton onClick={handleCancel} size="small" color="inherit" aria-label="Cancel">
          <CloseIcon />
        </IconButton>
        <Fab
          color="primary"
          aria-label={t(UI_TRANSLATION_KEYS.GROCERY_ADD_TITLE, 'Edit Grocery Item')}
          onClick={handleSave}
          size="small"
        >
          <SaveIcon />
        </Fab>
      </DialogActions>
    </Dialog>
  );
};

export default GroceryItemEditDialog;
