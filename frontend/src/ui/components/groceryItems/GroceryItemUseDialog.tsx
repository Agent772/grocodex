import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getUnitLabel } from '../../utils/getUnitLabel';
import { InputLabel, InputAdornment, Box, FormControl, Dialog, OutlinedInput, DialogTitle, DialogContent, DialogActions, Button, Fab, IconButton, Typography, Chip } from '@mui/material';
import { GroceryItemDocType } from '../../../types/dbCollections';
import { useGroceryItemDetails } from '../../hooks/useGroceryItemDetails';
import SaveIcon from '@mui/icons-material/Save';
import CloseIcon from '@mui/icons-material/Close';

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
      <DialogTitle>{t('groceryItem.use.title', 'Use Item')}</DialogTitle>
      <DialogContent sx={{ minWidth: 300 }}>
        <Box display="flex" alignItems="center" gap={1} mb={1}>
          <Typography gutterBottom>
            {t('groceryItem.use.available', 'Available')}: {totalRestQuantity}
          </Typography>
          <Chip label={totalRestQuantity + (product?.unit ? ' ' + getUnitLabel(product.unit, t) : '')} size="small" />
        </Box>
            <Box display={'flex'} alignItems={'center'} alignContent={'center'}>
              <FormControl fullWidth variant="outlined" sx={{ mt: 1 }}>
                <InputLabel htmlFor="outlined-adornment-amount">{t('groceryItem.use.amountUsed', 'Amount Used')}</InputLabel>
                <OutlinedInput
                  id="outlined-adornment-amount"
                  type="number"
                  label={t('groceryItem.use.amountUsed', 'Amount Used')}
                  value={usedAmount}
                  onChange={e => setUsedAmount(Number(e.target.value))}
                  endAdornment={<InputAdornment position="end">{product?.unit ? getUnitLabel(product.unit, t) : ''}</InputAdornment>}
                  inputProps={{
                    min: 0,
                    max: totalRestQuantity,
                    style: { textAlign: 'right' },
                    'aria-label': t('aria.amountUsed', 'Amount Used'),
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
                    {t('groceryItem.use.useAll', 'All')}
                </Button>
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
          disabled={!usedAmount}
          >
            <SaveIcon />
        </Fab>
      </DialogActions>
    </Dialog>
  );
};

export default GroceryItemUseDialog;
