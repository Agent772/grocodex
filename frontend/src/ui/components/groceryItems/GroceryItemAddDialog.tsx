import React, { useState, useEffect } from 'react';
import { useRxDB } from 'rxdb-hooks';
import { useProductGroupActions } from '../../hooks/useProductGroupActions';
import { useProductActions } from '../../hooks/useProductActions';
import { Fab, Autocomplete, Menu, Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Box, MenuItem, IconButton, CircularProgress } from '@mui/material';
import { ContainerBreadcrumbLabel, getContainerBreadcrumbLabel } from '../containers/ContainerBreadcrumbLabel';
import { useContainerSearch } from '../../hooks/useContainerSearch';
import { findGroceryItemByProductId } from '../../hooks/useGroceryItemSearch';
import { ArrowDropDown as ArrowDropDownIcon, Save as SaveIcon, QrCodeScanner as QrCodeScannerIcon, Close as CloseIcon, SaveAs as SaveAsIcon, LibraryAdd as LibraryAddIcon, DataSaverOn as DataSaverOnIcon } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { UNIT_OPTIONS } from '../../../types/unitOptions';
import { getUnitLabel } from '../../utils/getUnitLabel';
import { useGroceryItemActions } from '../../hooks/useGroceryItemActions';
import { GroceryItemDocType, ContainerDocType } from '../../../types/dbCollections';
import { ProductDocType, ProductGroupDocType } from '../../../types/dbCollections';
import { useProductSearchByBarcode } from '../../hooks/useProductSearchByBarcode';
import { useProductSearchByName } from '../../hooks/useProductSearchByName';
import BarcodeScannerDialog from '../BarcodeScannerDialog';
import { isValidEAN13, isValidEAN8 } from '../../../utils/barcodeValidation';


interface GroceryItemAddDialogProps {
  open: boolean;
  onClose: () => void;
  onSaved?: () => void;
  container?: ContainerDocType;
}



const GroceryItemAddDialog: React.FC<GroceryItemAddDialogProps> = ({ open, onClose, onSaved, container: initialContainer }) => {
  const db = useRxDB();
  const [container, setContainer] = useState<ContainerDocType | null>(initialContainer || null);
  const [productGroupOptions, setProductGroupOptions] = useState<any[]>([]);
  // Load all product groups on mount
  useEffect(() => {
    (async () => {
      try {
        const allGroups = db && db.collections && db.collections.product_group
          ? await db.collections.product_group.find().exec()
          : [];
        setProductGroupOptions(allGroups);
      } catch (e) {
        setProductGroupOptions([]);
      }
    })();
  }, [db]);
  const [productGroupInput, setProductGroupInput] = useState('');
  const [productGroup, setProductGroup] = useState<any>(null);
  const [productGroupDisabled, setProductGroupDisabled] = useState(false);

  const { containers: containerOptions } = useContainerSearch();
  const { t } = useTranslation();
  // Save actions
  const SAVE_ACTIONS = [
    { key: 'saveClose', label: t('groceryItem.add.save_close', 'Save & Close'), icon: <SaveIcon /> },
    { key: 'addNext', label: t('groceryItem.add.save_add_next', 'Save & Add Next'), icon: <LibraryAddIcon /> },
    { key: 'addSame', label: t('groceryItem.add.save_add_same', 'Save & Add Same'), icon: <SaveAsIcon /> },
    { key: 'saveScan', label: t('groceryItem.add.save_scan', 'Save & Scan'), icon: <DataSaverOnIcon /> },
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
  const [productName, setProductName] = useState('');
  const [manualFields, setManualFields] = useState({ productBrand: '', unit: 'g', quantity: '', buyDate: '', expirationDate: '', notes: '' });
  const [barcode, setBarcode] = useState('');
  const [scanning, setScanning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [lastSearchedBarcode, setLastSearchedBarcode] = useState('');
  const { addGroceryItem } = useGroceryItemActions();
  const { searchProduct } = useProductSearchByBarcode();
  const { searchProducts } = useProductSearchByName();
  const [productOptions, setProductOptions] = useState<any[]>([]);
  const [barcodeTriggerLookup, setBarcodeTriggerLookup] = useState<boolean>(false);

  // Product Group autocomplete search with debounce
  useEffect(() => {
    if (!productGroupInput || productGroupInput.length < 1) return;
    // Filter loaded product groups by input value
    setProductGroupOptions(prev =>
      prev.filter((g: any) =>
        g.name && g.name.toLowerCase().includes(productGroupInput.toLowerCase())
      )
    );
  }, [productGroupInput]);

  // Product autocomplete search, filtered by product group if selected
  useEffect(() => {
    if (!productName || productName.length < 2) {
      setProductOptions([]);
      return;
    }
    let active = true;
    setProductOptions([]);
    const handler = setTimeout(() => {
      (async () => {
        try {
          let results = await searchProducts(productName);
          if (productGroup && productGroup.id) {
            results = results.filter((p: any) => p.product_group_id === productGroup.id);
          } else if (productGroupInput && productGroupInput.length > 0) {
            results = results.filter((p: any) => p.product_group === productGroupInput);
          }
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
  }, [productName, productGroup, productGroupInput]);

  const handleScanBarcode = async () => {
    setScanning(true);
  };

  // Fill all fields from a DB product or API result object
  const fillAllFieldsFromProduct = async (product: any, dbInstance: any, source: 'db' | 'api' = 'db') => {
    setProductName(product.name || product.product_name || product.title || '');
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

    // Product Group logic
    if (product.product_group_id && dbInstance) {
      // DB product: fill from product_group_id
      const foundGroup = productGroupOptions.find(pg => pg.id === product.product_group_id);
      if (foundGroup) {
        setProductGroup(foundGroup);
        setProductGroupInput(foundGroup.name);
        setProductGroupDisabled(true);
      }
    } else if (product.product_group && typeof product.product_group === 'string') {
      // API product: fill from product_group string
      setProductGroupInput(product.product_group);
      setProductGroupDisabled(true);
    } else if (source === 'api') {
      // Open Food Facts: fill with product name
      setProductGroupInput(product.name || product.product_name || product.title || '');
      setProductGroupDisabled(true);
    }

    // Prefill container if a grocery item exists for this product
    if (product.id && dbInstance) {
      const groceryItem = await findGroceryItemByProductId(dbInstance, product.id);
      if (groceryItem && groceryItem.container_id) {
        const foundContainer = containerOptions.find(c => c.id === groceryItem.container_id);
        if (foundContainer) setContainer(foundContainer);
      }
    }
  };

  // Barcode search effect
  // Only trigger if barcode is changed by manual input, not by name selection
  useEffect(() => {
    const isValidBarcode =
      (isValidEAN8(barcode)) ||
      (isValidEAN13(barcode));
    console.log('Barcode changed:', barcode, 'Valid:', isValidBarcode, 'TriggerLookup:', barcodeTriggerLookup);
    if (isValidBarcode && barcode !== lastSearchedBarcode && barcodeTriggerLookup) {
      (async () => {
        setLoading(true);
        try {
          const product = await searchProduct(barcode);
          if (product) {
            await fillAllFieldsFromProduct(product, db);
          }
          setLastSearchedBarcode(barcode);
          setBarcodeTriggerLookup(false);
        } catch (e) {
          // Optionally handle error
        }
        setLoading(false);
      })();
    }
  }, [barcode, containerOptions, db]);

  const handleManualFieldChange = (field: string, value: string) => {
    if (field === 'unit') {
      // Prevent empty unit, fallback to 'g'
      setManualFields(prev => ({ ...prev, unit: value && value.trim() ? value : 'g' }));
    } else {
      setManualFields(prev => ({ ...prev, [field]: value }));
    }
  };

  const clearDialogFields = () => {
    setProductName('');
    setBarcode('');
    setManualFields({ productBrand: '', unit: 'g', quantity: '', buyDate: '', expirationDate: '', notes: '' });
    setProductGroupInput('');
    setProductGroup(null);
    setProductGroupDisabled(false);
    // If initialContainer is provided, reset to it; otherwise, clear
    setContainer(initialContainer || null);
  };

  const handleSave = async () => {
    // 1. Check for existing ProductGroup by name/brand
    let productGroup: ProductGroupDocType | null = await findProductGroupByName(productName);
    if (!productGroup) {
      productGroup = await addProductGroup({
        id: crypto.randomUUID(),
        name: productName,
        brand: manualFields.productBrand,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }

    // 2. Check for existing Product by name/unit/barcode
    let product: ProductDocType | null = await findProductByNameUnitQuantityBarcode(
      productName,
      manualFields.unit,
      Number(manualFields.quantity) || 0,
      barcode
    );
    if (!product) {
      product = await addProduct({
        id: crypto.randomUUID(),
        product_group_id: productGroup.id,
        name: productName,
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
      container_id: container ? container.id : '',
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


  // Autocomplete search on product change with debounce and async handling
  useEffect(() => {
    if (!productName || productName.length < 2) {
      setProductOptions([]);
      return;
    }
    let active = true;
    setProductOptions([]);
    const handler = setTimeout(() => {
      (async () => {
        try {
          const results = await searchProducts(productName);
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

  // Reset form fields when dialog is closed or opened
  useEffect(() => {
    if (!open) {
      setProductName('');
      setBarcode('');
      setManualFields({ productBrand: '', unit: 'g', quantity: '', buyDate: '', expirationDate: '', notes: '' });
      setContainer(null);
      setLastSearchedBarcode('');
      setProductGroupInput('');
      setProductGroup(null);
      setProductGroupDisabled(false);
    } else if (open && initialContainer) {
      setContainer(initialContainer);
    }
  }, [open, initialContainer]);

  // --- All hooks and logic above ---
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{t('groceryItem.add.title', 'Add Grocery Item')}</DialogTitle>
      <DialogContent sx={{ pb: 1 }}>
        <Box display="flex" flexDirection="column" gap={1} mt={2}>
          {/* Product Group Autocomplete/TextField - logic to be added next */}
          <Autocomplete
            freeSolo
            options={productGroupOptions}
            filterOptions={(options, { inputValue }) => {
              const filtered = options.filter((option: any) =>
                option.name && option.name.toLowerCase().includes(inputValue.toLowerCase())
              );
              // If no match, allow free text
              if (inputValue && !filtered.some((option: any) => option.name.toLowerCase() === inputValue.toLowerCase())) {
                return [...filtered, { name: inputValue, isNew: true }];
              }
              return filtered;
            }}
            getOptionLabel={option => typeof option === 'string' ? option : option.name || ''}
            inputValue={productGroupInput}
            onInputChange={(_, value) => {
              setProductGroupInput(value);
              setProductGroup(null);
              setProductGroupDisabled(false);
            }}
            onChange={(_, value) => {
              if (typeof value === 'string') {
                setProductGroupInput(value);
                setProductGroup(null);
                setProductGroupDisabled(false);
              } else if (value && typeof value === 'object') {
                setProductGroup(value.isNew ? null : value);
                setProductGroupInput(value.name);
                setProductGroupDisabled(false);
              }
            }}
            renderOption={(props, option) => (
              <li {...props} style={option.isNew ? { fontStyle: 'italic', color: '#888' } : {}}>
                {option.name}
                {option.isNew ? ` (${t('productGroup.add_new', 'Add new')})` : ''}
              </li>
            )}
            renderInput={params => (
              <TextField
                {...params}
                label={t('productGroup.label', 'Product Group')}
                fullWidth
                required
                disabled={productGroupDisabled}
              />
            )}
            sx={{ mb: 1 }}
            disabled={productGroupDisabled}
          />
          {/* Product Autocomplete/TextField */}
          <Autocomplete
            freeSolo
            options={productOptions}
            getOptionLabel={option => option.name || ''}
            inputValue={productName}
            onInputChange={(_, value) => setProductName(value)}
            onChange={async (_, value) => {
              if (typeof value === 'string') {
                setProductName(value);
              } else if (value && typeof value === 'object') {
                setProductName(value.name || '');
                await fillAllFieldsFromProduct(value, db);
              }
            }}
            renderInput={params => (
              <TextField
                {...params}
                label={t('groceryItem.add.product_name', 'Product')}
                fullWidth
                autoFocus
                required
              />
            )}
          />
          <Box display="flex" alignItems="center" gap={1}>
            <TextField
              label={t('product.barcode', 'Barcode')}
              value={barcode}
              onChange={e => {
                setBarcode(e.target.value);
                setBarcodeTriggerLookup(true);
              }}
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
            label={t('product.brand', 'Brand')}
            value={manualFields.productBrand}
            onChange={e => handleManualFieldChange('productBrand', e.target.value)}
            fullWidth
          />
          <Box display="flex" alignItems="center" gap={1}>
            <TextField
              label={t('product.quantity', 'Quantity')}
              value={manualFields.quantity}
              onChange={e => handleManualFieldChange('quantity', e.target.value)}
              fullWidth
            />
            <TextField
              select
              label={t('product.unit', 'Unit')}
              value={manualFields.unit}
              onChange={e => handleManualFieldChange('unit', e.target.value)}
              sx={{ width: { xs: '20vw', sm: '7vw' } }}
            >
              {UNIT_OPTIONS.map(opt => (
                <MenuItem key={opt} value={opt}>{getUnitLabel(opt, t)}</MenuItem>
              ))}
            </TextField>
          </Box>
          <Box display="flex" alignItems="center" gap={1}>
            <TextField
              label={t('groceryItem.buyDate', 'Buy Date')}
              type="date"
              value={manualFields.buyDate || new Date().toISOString().slice(0, 10)}
              onChange={e => handleManualFieldChange('buyDate', e.target.value)}
              slotProps={{
                inputLabel: { shrink: true }
              }}
              fullWidth
            />
            <TextField
              label={t('groceryItem.expirationDate', 'Expiration Date')}
              type="date"
              value={manualFields.expirationDate}
              onChange={e => handleManualFieldChange('expirationDate', e.target.value)}
              slotProps={{
                inputLabel: { shrink: true }
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
        {scanning && (
          <BarcodeScannerDialog
            open={scanning}
            onClose={() => setScanning(false)}
            onScan={(code) => {
              setBarcode(code);
              setScanning(false);
            }}
          />
        )}
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
            disabled={!productName.trim() || !manualFields.unit.trim() || !manualFields.quantity.trim()}
            size="small"
          >
            {SAVE_ACTIONS.find(a => a.key === saveAction)?.icon}
          </Fab>
          <IconButton
            aria-label={t('groceryItem.add.save_action', 'Select Save Action')}
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