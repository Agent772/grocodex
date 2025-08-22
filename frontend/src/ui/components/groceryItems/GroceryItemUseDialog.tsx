import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { InputLabel, InputAdornment, Box, Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Typography } from '@mui/material';
import { FormControl, OutlinedInput, FormHelperText } from '@mui/material';
import { GroceryItemDocType } from '../../../types/dbCollections';
import { useGroceryItemDetails } from '../../hooks/useGroceryItemDetails';

export interface GroceryItemUseDialogProps {
  open: boolean;
  onClose: () => void;
  groceryItems: GroceryItemDocType[];
  onSave: (usedAmount: number) => Promise<void>;
}

const GroceryItemUseDialog: React.FC<GroceryItemUseDialogProps> = ({ open, onClose, groceryItems, onSave }) => {
  const mainItem = groceryItems[0];
  const { product } = useGroceryItemDetails(mainItem);
  const { t } = useTranslation();
  const [usedAmount, setUsedAmount] = useState<number>(0);
  const totalRestQuantity = groceryItems.reduce((sum, item) => sum + (item.rest_quantity ?? 0), 0);

  const handleSave = async () => {
    await onSave(usedAmount);
    setUsedAmount(0);
    onClose();
  };

  const handleCancel = () => {
    setUsedAmount(0);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{t('groceryItem.UseDialog.title', 'Use Item')}</DialogTitle>
      <DialogContent sx={{ minWidth: 300 }}>
        <Typography gutterBottom>
          {t('groceryItem.UseDialog.available', 'Available')}: {totalRestQuantity}
        </Typography>
            <Box display={'flex'} alignItems={'center'} alignContent={'center'}>
              <FormControl fullWidth variant="outlined" sx={{ mt: 1 }}>
                <InputLabel htmlFor="outlined-adornment-amount">{t('groceryItem.UseDialog.amountUsed', 'Amount Used')}</InputLabel>
                <OutlinedInput
                  id="outlined-adornment-amount"
                  type="number"
                  label={t('groceryItem.UseDialog.amountUsed', 'Amount Used')}
                  value={usedAmount}
                  onChange={e => setUsedAmount(Number(e.target.value))}
                  endAdornment={<InputAdornment position="end">{product?.unit || ''}</InputAdornment>}
                  inputProps={{
                    min: 0,
                    max: totalRestQuantity,
                    style: { textAlign: 'right' },
                    'aria-label': 'amount',
                  }}
                  required
                />
              </FormControl>
            </Box>
            <Box display={'flex'} justifyContent={'flex-end'}>
                <Button
                    sx={{ mt: 2 }}
                    variant="outlined"
                    color="secondary"
                    onClick={() => setUsedAmount(totalRestQuantity)}
                >
                    {t('groceryItem.UseDialog.useAll', 'All')}
                </Button>
            </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCancel}>{t('groceryItem.UseDialog.cancel', 'Cancel')}</Button>
        <Button onClick={handleSave} variant="contained" color="primary" disabled={usedAmount <= 0 || usedAmount > totalRestQuantity}>
          {t('groceryItem.UseDialog.save', 'Save')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default GroceryItemUseDialog;
