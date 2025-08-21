import React, { useState, useEffect } from 'react';
import { useRxDB } from '../../../db/RxDBProvider';
import { useProductGroupActions } from '../../hooks/useProductGroupActions';
import { useProductActions } from '../../hooks/useProductActions';
import { Fab, Autocomplete, Menu, Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Box, MenuItem, IconButton, CircularProgress } from '@mui/material';
import { ArrowDropDown as ArrowDropDownIcon, Save as SaveIcon, QrCodeScanner as QrCodeScannerIcon, Close as CloseIcon, SaveAs as SaveAsIcon, LibraryAdd as LibraryAddIcon, DataSaverOn as DataSaverOnIcon } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { UI_TRANSLATION_KEYS } from '../../../types/uiTranslationKeys';
import { UNIT_OPTIONS } from '../../../types/unitOptions';
import { lookupOpenFoodFactsBarcode } from '../../../external/openFoodFacts';
import { useGroceryItemActions } from '../../hooks/useGroceryItemActions';
import { GroceryItemDocType } from '../../../types/dbCollections';
import { ProductDocType, ProductGroupDocType } from '../../../types/dbCollections';
import { useProductSearchByBarcode } from '../../hooks/useProductSearchByBarcode';
import { useProductSearchByName } from '../../hooks/useProductSearchByName';

interface GroceryItemAddDialogProps {
  open: boolean;
  onClose: () => void;
  onSaved?: () => void;
}


const GroceryItemAddDialog: React.FC<GroceryItemAddDialogProps> = ({ open, onClose, onSaved }) => {
  // Save actions
  const SAVE_ACTIONS = [
    { key: 'saveClose', label: 'Save & Close', icon: <SaveIcon /> },
    { key: 'addNext', label: 'Save & Add Next', icon: <LibraryAddIcon /> },
    { key: 'addSame', label: 'Save & Add Same', icon: <SaveAsIcon /> },
    { key: 'saveScan', label: 'Save & Scan', icon: <DataSaverOnIcon /> },
  ];
  const [saveAction, setSaveAction] = useState('saveClose');
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);

  // Save action handler
  const handleSaveAction = async () => {
    await handleSave();
    switch (saveAction) {
      case 'saveClose':
        onClose();
        break;
      case 'addNext':
        clearDialogFields();
        // Keep dialog open, fields cleared
        break;
      case 'addSame':
        // Keep dialog open, fields NOT cleared (allow adding same item again)
        break;
      case 'saveScan':
        clearDialogFields();
        setScanning(true); // Enter scan mode for next item
        break;
      default:
        onClose();
    }
    if (onSaved) onSaved();
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchor(event.currentTarget);
  };
  const handleMenuClose = () => {
    setMenuAnchor(null);
  };
  const handleMenuSelect = (actionKey: string) => {
    setSaveAction(actionKey);
    setMenuAnchor(null);
  };
  const { findProductGroupByName, addProductGroup } = useProductGroupActions();
  const { findProductByNameUnitQuantityBarcode, addProduct } = useProductActions();
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [manualFields, setManualFields] = useState({ productBrand: '', unit: '', quantity: '', buyDate: '', expirationDate: '', notes: '' });
  const [barcode, setBarcode] = useState('');
  const [scanning, setScanning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [lastSearchedBarcode, setLastSearchedBarcode] = useState('');
  const { addGroceryItem } = useGroceryItemActions();
  const { searchProduct } = useProductSearchByBarcode();
  const { searchProducts } = useProductSearchByName();
  const [productOptions, setProductOptions] = useState<any[]>([]);

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
    // Fill barcode directly, but do not trigger barcode search effect
    setBarcode(product.barcode || '');
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

  // Barcode search effect
  // Barcode search effect
  // Only trigger if barcode is changed by manual input, not by name selection
  useEffect(() => {
    const isValidBarcode = barcode && barcode.length === 13 && /^\d{13}$/.test(barcode);
    // Only run if barcode is changed and not just set from name selection
    if (isValidBarcode && barcode !== lastSearchedBarcode) {
      (async () => {
        setLoading(true);
        try {
          const product = await searchProduct(barcode);
          if (product) {
            fillAllFieldsFromProduct(product);
          }
          setLastSearchedBarcode(barcode);
        } catch (e) {
          // Optionally handle error
        }
        setLoading(false);
      })();
    }
  }, [barcode]);

  const handleManualFieldChange = (field: string, value: string) => {
    setManualFields(prev => ({ ...prev, [field]: value }));
  };

  const clearDialogFields = () => {
    setName('');
    setBarcode('');
    setManualFields({ productBrand: '', unit: '', quantity: '', buyDate: '', expirationDate: '', notes: '' });
  };

  const db = useRxDB();
  const handleSave = async () => {
    // 1. Check for existing ProductGroup by name/brand
    let productGroup: ProductGroupDocType | null = await findProductGroupByName(name);
    if (!productGroup) {
      productGroup = await addProductGroup({
        id: crypto.randomUUID(),
        name,
        brand: manualFields.productBrand,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }

    // 2. Check for existing Product by name/unit/barcode
    let product: ProductDocType | null = await findProductByNameUnitQuantityBarcode(
      name,
      manualFields.unit,
      Number(manualFields.quantity) || 0,
      barcode
    );
    if (!product) {
      product = await addProduct({
        id: crypto.randomUUID(),
        product_group_id: productGroup.id,
        name,
        brand: manualFields.productBrand,
        barcode,
        unit: manualFields.unit,
        quantity: Number(manualFields.quantity) || 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }

    // 3. Create GroceryItem referencing Product
    if (!product) return;
    const groceryItem: GroceryItemDocType = {
      id: crypto.randomUUID(),
      product_id: product.id,
      container_id: '', // Add container selection logic if needed
      rest_quantity: manualFields.quantity ? Number(manualFields.quantity) : undefined,
      expiration_date: manualFields.expirationDate || undefined,
      buy_date: manualFields.buyDate || undefined,
      is_opened: false,
      opened_date: undefined,
      notes: manualFields.notes || undefined,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    await addGroceryItem(groceryItem);
    clearDialogFields();
    onClose();
    if (onSaved) onSaved();
  };

  const handleCancel = () => {
    clearDialogFields();
    onClose();
  };


  // Autocomplete search on name change with debounce and async handling
  useEffect(() => {
    if (!name || name.length < 2) {
      setProductOptions([]);
      return;
    }
    let active = true;
    setProductOptions([]);
    const handler = setTimeout(() => {
      (async () => {
        try {
          const results = await searchProducts(name);
          if (active) setProductOptions(results);
        } catch (e) {
          if (active) setProductOptions([]);
        }
      })();
    }, 300); // debounce 300ms
    return () => {
      active = false;
      clearTimeout(handler);
    };
  }, [name]);

  // Reset form fields when dialog is closed
  useEffect(() => {
    if (!open) {
      setName('');
      setBarcode('');
      setManualFields({ productBrand: '', unit: '', quantity: '', buyDate: '', expirationDate: '', notes: '' });
      setLastSearchedBarcode('');
    }
  }, [open]);

  // --- All hooks and logic above ---
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{t(UI_TRANSLATION_KEYS.GROCERY_ADD_TITLE, 'Add Grocery Item')}</DialogTitle>
      <DialogContent sx={{ pb: 1 }}>
        <Box display="flex" flexDirection="column" gap={1} mt={2}>
          <Autocomplete
            freeSolo
            options={productOptions}
            getOptionLabel={option => option.name || ''}
            inputValue={name}
            onInputChange={(_, value) => setName(value)}
            onChange={(_, value) => {
              if (typeof value === 'string') {
                setName(value);
              } else if (value && typeof value === 'object') {
                setName(value.name || '');
                fillAllFieldsFromProduct(value);
              }
            }}
            renderInput={params => (
              <TextField
                {...params}
                label={t(UI_TRANSLATION_KEYS.GROCERY_NAME, 'Name')}
                fullWidth
                autoFocus
                required
              />
            )}
          />
          <Box display="flex" alignItems="center" gap={1}>
            <TextField
              label={t(UI_TRANSLATION_KEYS.GROCERY_BARCODE, 'Barcode')}
              value={barcode}
              onChange={e => setBarcode(e.target.value)}
              sx={{ width: '100%' }}
            />
            {loading && barcode ? (
              <CircularProgress size={32} />
            ) : (
              <IconButton color="primary" onClick={handleScanBarcode} disabled={scanning}>
                <QrCodeScannerIcon />
              </IconButton>
            )}
          </Box>
          <TextField
            label={t(UI_TRANSLATION_KEYS.GROCERY_BRAND, 'Brand')}
            value={manualFields.productBrand}
            onChange={e => handleManualFieldChange('productBrand', e.target.value)}
            fullWidth
          />
          <Box display="flex" alignItems="center" gap={1}>
            <TextField
              label={t(UI_TRANSLATION_KEYS.GROCERY_QUANTITY, 'Quantity')}
              value={manualFields.quantity}
              onChange={e => handleManualFieldChange('quantity', e.target.value)}
              fullWidth
            />
            <TextField
              select
              label={t(UI_TRANSLATION_KEYS.GROCERY_UNIT, 'Unit')}
              value={manualFields.unit}
              onChange={e => handleManualFieldChange('unit', e.target.value)}
              sx={{ width: '20vw' }}
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
        </Box>
      </DialogContent>
      <DialogActions>
        <IconButton onClick={handleCancel} size="small" color="inherit" aria-label="Cancel">
          <CloseIcon />
        </IconButton>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Fab
            color="primary"
            aria-label={SAVE_ACTIONS.find(a => a.key === saveAction)?.label}
            onClick={handleSaveAction}
            disabled={!name.trim() || !manualFields.unit.trim() || !manualFields.quantity.trim()}
            size="small"
          >
            {SAVE_ACTIONS.find(a => a.key === saveAction)?.icon}
          </Fab>
          <IconButton
            aria-label="Select Save Action"
            onClick={handleMenuOpen}
            size="small"
          >
            <ArrowDropDownIcon />
          </IconButton>
          <Menu
            anchorEl={menuAnchor}
            open={Boolean(menuAnchor)}
            onClose={handleMenuClose}
          >
            {SAVE_ACTIONS.map(action => (
              <MenuItem
                key={action.key}
                selected={action.key === saveAction}
                onClick={() => handleMenuSelect(action.key)}
              >
                {action.icon}
                {action.label}
              </MenuItem>
            ))}
          </Menu>
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default GroceryItemAddDialog;