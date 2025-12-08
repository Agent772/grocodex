import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  IconButton,
  CircularProgress
} from '@mui/material';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import CloseIcon from '@mui/icons-material/Close';
import { useTranslation } from 'react-i18next';
import { useRxDB } from 'rxdb-hooks';
import { useShoppingListItemActions } from '../../hooks/useShoppingListItemActions';
import { ShoppingListItemDocType } from '../../../types/dbCollections';
import { UnitDropdown } from '../UnitDropdown';
import BarcodeScannerDialog from '../BarcodeScannerDialog';
import { useProductSearchByBarcode } from '../../hooks/useProductSearchByBarcode';
import { isValidEAN13, isValidEAN8 } from '../../../utils/barcodeValidation';
import { UNIT_OPTIONS } from '../../../types/unitOptions';

interface ShoppingListItemEditDialogProps {
  open: boolean;
  onClose: () => void;
  onSaved?: () => void;
  listId: string;
  item?: ShoppingListItemDocType;
}

export const ShoppingListItemEditDialog: React.FC<ShoppingListItemEditDialogProps> = ({
  open,
  onClose,
  onSaved,
  listId,
  item
}) => {
  const { t } = useTranslation();
  const db = useRxDB();
  const { addManualItem, updateShoppingListItem, addItemFromPantry } = useShoppingListItemActions();
  const { searchProduct } = useProductSearchByBarcode();
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState<number>(1);
  const [unit, setUnit] = useState<string>('pcs');
  const [count, setCount] = useState<number>(1);
  const [comment, setComment] = useState('');
  const [barcode, setBarcode] = useState('');
  const [scanning, setScanning] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setName(item?.name || '');
      setQuantity(item?.quantity || 1);
      setUnit(item?.unit || 'pcs');
      setCount(item?.count || 1);
      setComment(item?.comment || '');
      setBarcode('');
    }
  }, [open, item]);

  // Barcode lookup effect
  useEffect(() => {
    const isValidBarcode = isValidEAN8(barcode) || isValidEAN13(barcode);
    if (!isValidBarcode || !barcode || !open) return;

    const lookupBarcode = async () => {
      setLoading(true);
      try {
        // First, check if there's a product in the database
        const dbProduct = await searchProduct(barcode);
        
        if (dbProduct) {
          // Check if there's a grocery item for this product
          const groceryItems = db?.collections?.grocery_item 
            ? await db.collections.grocery_item.find({ selector: { product_id: dbProduct.id } }).exec()
            : [];
          
          if (groceryItems && groceryItems.length > 0) {
            // Found in pantry - add from pantry
            const groceryItem = groceryItems[0];
            const quantity = groceryItem.rest_quantity || dbProduct.quantity || 1;
            await addItemFromPantry(listId, dbProduct.id, quantity);
            // Close dialog after adding from pantry
            handleClose();
            if (onSaved) onSaved();
            setLoading(false);
            return;
          }
          
          // Product exists but not in pantry - fill fields from product
          setName(dbProduct.name || '');
          setQuantity(dbProduct.quantity || 1);
          setUnit(dbProduct.unit || 'pcs');
        } else {
          // Not in DB - try Open Food Facts API
          const response = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`);
          const data = await response.json();
          
          if (data.status === 1 && data.product) {
            const apiProduct = data.product;
            setName(apiProduct.product_name || apiProduct.product_name_en || '');
            
            // Extract quantity and unit from product_quantity string
            let extractedUnit = 'pcs';
            let extractedQuantity = 1;
            
            if (apiProduct.product_quantity) {
              const quantityStr = String(apiProduct.product_quantity);
              const match = quantityStr.match(/^(\d+(?:\.\d+)?)\s*([a-zA-Z]+)?$/);
              if (match) {
                extractedQuantity = parseFloat(match[1]) || 1;
                if (match[2] && UNIT_OPTIONS.includes(match[2])) {
                  extractedUnit = match[2];
                }
              }
            }
            
            setQuantity(extractedQuantity);
            setUnit(extractedUnit);
          }
        }
      } catch (error) {
        console.error('Error looking up barcode:', error);
      }
      setLoading(false);
    };

    lookupBarcode();
  }, [barcode, open]);

  const handleSave = async (andNext: boolean = false) => {
    if (!name.trim() || quantity <= 0) return;

    try {
      if (item) {
        // Update existing item
        await updateShoppingListItem(item.id, {
          name: name.trim(),
          quantity,
          unit,
          count,
          comment: comment.trim() || undefined
        });
      } else {
        // Create new item
        await addManualItem(
          listId,
          name.trim(),
          unit,
          quantity,
          count,
          comment.trim() || undefined
        );
      }
      
      if (andNext) {
        // Reset form for next entry
        setName('');
        setQuantity(1);
        setUnit('pcs');
        setCount(1);
        setComment('');
      } else {
        handleClose();
        if (onSaved) onSaved();
      }
    } catch (error) {
      console.error('Error saving shopping list item:', error);
    }
  };

  const handleClose = () => {
    setName('');
    setQuantity(1);
    setUnit('pcs');
    setCount(1);
    setComment('');
    setBarcode('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {item ? t('shoppingList.editItem') : t('shoppingList.addItem')}
        <IconButton
          onClick={handleClose}
          size="small"
          aria-label={t('aria.close')}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TextField
              label={t('common.barcode')}
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
              fullWidth
            />
            {loading ? (
              <CircularProgress size={32} />
            ) : (
              <IconButton color="primary" onClick={() => setScanning(true)} disabled={scanning}>
                <QrCodeScannerIcon />
              </IconButton>
            )}
          </Box>

          <TextField
            autoFocus={!barcode}
            label={t('shoppingList.itemName')}
            fullWidth
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField
              label={t('common.quantity')}
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(parseFloat(e.target.value) || 0)}
              sx={{ width: '50%' }}
            />
            <UnitDropdown
              value={unit}
              onChange={setUnit}
              sx={{ width: '30%' }}
              label={t('common.unit')}
            />
            <TextField
              label={t('shoppingList.count')}
              type="number"
              value={count}
              onChange={(e) => setCount(parseInt(e.target.value) || 1)}
              slotProps={{ 
                input: { 
                  inputProps: { min: 1, step: 1, style: { textAlign: 'right' } }
                }
              }}
              sx={{ width: '20%' }}
            />
          </Box>

          <TextField
            label={t('common.comment')}
            fullWidth
            multiline
            rows={2}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
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
        <Button onClick={handleClose}>{t('common.cancel')}</Button>
        {!item && (
          <Button 
            onClick={() => handleSave(true)} 
            variant="outlined"
            disabled={!name.trim() || quantity <= 0}
          >
            {t('shoppingList.saveAndNext')}
          </Button>
        )}
        <Button 
          onClick={() => handleSave(false)} 
          variant="contained" 
          disabled={!name.trim() || quantity <= 0}
        >
          {t('common.save')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
