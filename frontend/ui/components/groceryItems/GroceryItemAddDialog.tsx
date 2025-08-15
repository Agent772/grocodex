
import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Box, MenuItem, IconButton, CircularProgress } from '@mui/material';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import { useTranslation } from 'react-i18next';
import { UI_TRANSLATION_KEYS } from '../../../types/uiTranslationKeys';
import { UNIT_OPTIONS } from '../../../types/unitOptions';
import { useProducts } from '../../../db/hooks/useProducts';
import { searchProductsAndGroups } from '../../../db/search/searchProductsAndGroups';
import { lookupOpenFoodFactsBarcode } from '../../../db/entities/openFoodFacts';


interface GroceryItemAddDialogProps {
  open: boolean;
  onClose: () => void;
  onSaved?: () => void;
}


const GroceryItemAddDialog: React.FC<GroceryItemAddDialogProps> = ({ open, onClose, onSaved }) => {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [manualFields, setManualFields] = useState({ productBrand: '', unit: '', quantity: '', buyDate: '', expirationDate: '', notes: '' });
  const [barcode, setBarcode] = useState('');
  const { getByBarcode, getByName } = useProducts();
  const [scanning, setScanning] = useState(false);
  const [loading, setLoading] = useState(false);

  // Scan barcode handler (mock, replace with real scanner integration)
  const handleScanBarcode = async () => {
    setScanning(true);
    // Here you would integrate QuaggaJS or zxing-js for barcode scanning
    // For now, simulate with a prompt
    const code = window.prompt('Scan or enter barcode:');
    if (code) {
      setBarcode(code);
    }
    setScanning(false);
  };

  // Fill all fields from a DB product or API result object
  const fillAllFieldsFromProduct = (product: any) => {
    setName(product.name || product.product_name || product.title || '');
    let unit = product.unit || product.unit_name || product.quantity_unit || product.product_quantity_unit || '';
    if (!unit && typeof product.quantity === 'string') {
      const match = product.quantity.match(/\d+\s*([a-zA-Z]+)/);
      if (match && match[1]) {
        unit = match[1];
      }
    }
    if (!unit && typeof product.product_quantity === 'string') {
      const match = product.product_quantity.match(/\d+\s*([a-zA-Z]+)/);
      if (match && match[1]) {
        unit = match[1];
      }
    }
    if (!UNIT_OPTIONS.includes(unit)) {
      unit = '';
    }
    setManualFields(prev => ({
      ...prev,
      productBrand: product.brand || product.brands || '',
      unit,
      quantity: product.quantity ? String(product.quantity) : (product.product_quantity ? String(product.product_quantity) : ''),
      buyDate: product.buyDate || '',
      expirationDate: product.expirationDate || '',
      notes: product.notes || '',
    }));
  };

  // Function to check DB first, then call OFF API if not found
  const handleLoadFromOFF = async () => {
    if (!barcode) return;
    setLoading(true);
    try {
      const dbProducts = await getByBarcode(barcode);
      if (dbProducts && dbProducts.length > 0) {
        fillAllFieldsFromProduct(dbProducts[0]);
      } else {
        const offProduct = await lookupOpenFoodFactsBarcode(barcode);
        if (offProduct) {
          fillAllFieldsFromProduct(offProduct);
        }
      }
    } catch (e) {
      // Optionally handle error (e.g., show message)
    }
    setLoading(false);
  };

  // Auto-load when barcode is 13 digits
  useEffect(() => {
    const isValidBarcode = barcode && barcode.length === 13 && /^\d{13}$/.test(barcode);
    if (isValidBarcode) {
      (async () => {
        setLoading(true);
        try {
          console.log('Barcode lookup triggered for:', barcode);
          const dbProducts = await getByBarcode(barcode);
          console.log('DB products:', dbProducts);
          if (dbProducts && dbProducts.length > 0) {
            fillAllFieldsFromProduct(dbProducts[0]);
          } else {
            const offProduct = await lookupOpenFoodFactsBarcode(barcode);
            console.log('Open Food Facts product:', offProduct);
            if (offProduct) {
              fillAllFieldsFromProduct(offProduct);
            }
          }
        } catch (e) {
          console.error('Barcode lookup error:', e);
        }
        setLoading(false);
      })();
    }
  }, [barcode, getByBarcode]);

  const handleManualFieldChange = (field: string, value: string) => {
    setManualFields(prev => ({ ...prev, [field]: value }));
  };



  const handleSave = () => {
    const saveData = {
      groupName: name,
      productName: name,
      groupBrand: manualFields.productBrand,
      productBrand: manualFields.productBrand,
      unit: manualFields.unit,
      quantity: manualFields.quantity,
      buyDate: manualFields.buyDate,
      expirationDate: manualFields.expirationDate,
      notes: manualFields.notes,
      barcode,
    };
    // ...actual save logic using saveData...
    onClose();
    if (onSaved) onSaved();
  };


  // Debounced search on name change
  useEffect(() => {
    if (!name) return;
    const handler = setTimeout(() => {
      (async () => {
        const results = await searchProductsAndGroups(name);
        if (results.length > 0) {
          // For now, just use the first result
          fillAllFieldsFromProduct(results[0].item);
          // TODO: handle multiple results (show selection UI)
        }
      })();
    }, 400); // 400ms debounce
    return () => clearTimeout(handler);
  }, [name]);

    // Auto-load when barcode is 13 digits
    useEffect(() => {
      const isValidBarcode = barcode && barcode.length === 13 && /^\d{13}$/.test(barcode);
      if (isValidBarcode) {
        (async () => {
          setLoading(true);
          try {
            const dbProducts = await getByBarcode(barcode);
            if (dbProducts && dbProducts.length > 0) {
              fillAllFieldsFromProduct(dbProducts[0]);
            } else {
              const offProduct = await lookupOpenFoodFactsBarcode(barcode);
              if (offProduct) {
                fillAllFieldsFromProduct(offProduct);
              }
            }
          } catch (e) {
            // Optionally handle error
          }
          setLoading(false);
        })();
      }
    }, [barcode, getByBarcode]);

  // Debounced search on name change
  useEffect(() => {
    if (!name) return;
    const handler = setTimeout(() => {
      (async () => {
        const results = await searchProductsAndGroups(name);
        if (results.length > 0) {
          // For now, just use the first result
          fillAllFieldsFromProduct(results[0].item);
          // TODO: handle multiple results (show selection UI)
        }
      })();
    }, 400); // 400ms debounce
    return () => clearTimeout(handler);
  }, [name]);

  // --- All hooks and logic above ---
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{t(UI_TRANSLATION_KEYS.GROCERY_ADD_TITLE, 'Add Grocery Item')}</DialogTitle>
      <DialogContent>
        <Box display="flex" flexDirection="column" gap={2}>
          <TextField
            label={t(UI_TRANSLATION_KEYS.GROCERY_NAME, 'Name')}
            value={name}
            onChange={e => setName(e.target.value)}
            fullWidth
            autoFocus
          />
          <Box display="flex" alignItems="center" gap={1}>
            <TextField
              label={t(UI_TRANSLATION_KEYS.GROCERY_BARCODE, 'Barcode')}
              value={barcode}
              onChange={e => setBarcode(e.target.value)}
              sx={{ maxWidth: 160 }}
            />
            <IconButton color="primary" onClick={handleScanBarcode} disabled={scanning}>
              <QrCodeScannerIcon />
            </IconButton>
          </Box>
          <TextField
            label={t(UI_TRANSLATION_KEYS.GROCERY_BRAND, 'Brand')}
            value={manualFields.productBrand}
            onChange={e => handleManualFieldChange('productBrand', e.target.value)}
            fullWidth
          />
          <TextField
            select
            label={t(UI_TRANSLATION_KEYS.GROCERY_UNIT, 'Unit')}
            value={manualFields.unit}
            onChange={e => handleManualFieldChange('unit', e.target.value)}
            fullWidth
          >
            {UNIT_OPTIONS.map(opt => (
              <MenuItem key={opt} value={opt}>{opt}</MenuItem>
            ))}
          </TextField>
          <TextField
            label={t(UI_TRANSLATION_KEYS.GROCERY_QUANTITY, 'Quantity')}
            value={manualFields.quantity}
            onChange={e => handleManualFieldChange('quantity', e.target.value)}
            fullWidth
          />
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
          <TextField
            label={t(UI_TRANSLATION_KEYS.GROCERY_NOTES, 'Notes')}
            value={manualFields.notes}
            onChange={e => handleManualFieldChange('notes', e.target.value)}
            fullWidth
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">{t(UI_TRANSLATION_KEYS.COMMON_CANCEL, 'Cancel')}</Button>
        <Button onClick={handleSave} variant="contained" color="primary" disabled={!name.trim()}>
          {t(UI_TRANSLATION_KEYS.GROCERY_ADD, 'Add')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default GroceryItemAddDialog;