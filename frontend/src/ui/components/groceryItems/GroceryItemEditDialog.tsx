import React, { useState, useEffect, useCallback } from 'react';
import { useRxDB } from 'rxdb-hooks';
import { Fab, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Box, IconButton, Autocomplete, InputAdornment, useTheme } from '@mui/material';
import useEmblaCarousel from 'embla-carousel-react';
import { ContainerBreadcrumbLabel, getContainerBreadcrumbLabel } from '../containers/ContainerBreadcrumbLabel';
import { useContainerSearch } from '../../hooks/useContainerSearch';
import { Save as SaveIcon, Close as CloseIcon, ChevronLeft, ChevronRight } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useGroceryItemActions } from '../../hooks/useGroceryItemActions';
import { GroceryItemDocType, ContainerDocType } from '../../../types/dbCollections';
import { ProductDocType, ProductGroupDocType } from '../../../types/dbCollections';
import { getUnitLabel } from '../../utils/getUnitLabel';
import useMediaQuery from '@mui/material/useMediaQuery';
import './GroceryItemEditDialog.css';

interface GroceryItemEditDialogProps {
  open: boolean;
  groceryItems: GroceryItemDocType[];
  initialIndex?: number;
  onClose: () => void;
  onSaved?: () => void;
}

const GroceryItemEditDialog: React.FC<GroceryItemEditDialogProps> = ({ 
  open, 
  groceryItems, 
  initialIndex = 0,
  onClose, 
  onSaved,
}) => {
  const db = useRxDB();
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('sm'));
  const [container, setContainer] = useState<ContainerDocType | null>(null);
  const [productGroup, setProductGroup] = useState<ProductGroupDocType | null>(null);
  const { containers: containerOptions } = useContainerSearch();
  const { t } = useTranslation();
  const [manualFields, setManualFields] = useState({ productBrand: '', unit: '', quantity: '', buyDate: '', expirationDate: '', notes: '' });
  const [barcode, setBarcode] = useState('');
  const [productName, setProductName] = useState('');
  const { updateGroceryItem } = useGroceryItemActions();
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const currentGroceryItem = groceryItems[currentIndex];
  const [itemsData, setItemsData] = useState<Map<string, any>>(new Map());

  // Save current item data to itemsData Map
  const saveCurrentItemData = useCallback(() => {
    if (currentGroceryItem) {
      setItemsData(prev => {
        const newMap = new Map(prev);
        newMap.set(currentGroceryItem.id, {
          manualFields: { ...manualFields },
          container,
          productName,
          barcode,
          productGroup
        });
        return newMap;
      });
    }
  }, [currentGroceryItem, manualFields, container, productName, barcode, productGroup]);

  // Setup Embla carousel navigation (avoiding infinite loops)
  useEffect(() => {
    if (emblaApi) {
      const onSelect = () => {
        const newIndex = emblaApi.selectedScrollSnap();
        if (newIndex !== currentIndex) {
          // Save current form data before switching
          saveCurrentItemData();
          setCurrentIndex(newIndex);
        }
      };
      emblaApi.on('select', onSelect);
      return () => {
        emblaApi.off('select', onSelect);
      };
    }
  }, [emblaApi, currentIndex, saveCurrentItemData]); // Now saveCurrentItemData is stable

  useEffect(() => {
    if (!open) {
      setProductName('');
      setBarcode('');
      setManualFields({ productBrand: '', unit: '', quantity: '', buyDate: '', expirationDate: '', notes: '' });
      setContainer(null);
      setProductGroup(null);
      setItemsData(new Map()); // Clear all cached data when dialog closes
    } else if (currentGroceryItem) {
      // Check if we have cached data for this item first
      const cachedData = itemsData.get(currentGroceryItem.id);
      if (cachedData) {
        // Load from cache to avoid DB calls and preserve user changes
        setManualFields(cachedData.manualFields);
        setContainer(cachedData.container);
        setProductName(cachedData.productName);
        setBarcode(cachedData.barcode);
        setProductGroup(cachedData.productGroup);
      } else {
        // Load fresh data from DB for new item
        (async () => {
          let product: ProductDocType | null = null;
          if (currentGroceryItem.product_id && db && db.collections.product) {
            const doc = await db.collections.product.findOne({ selector: { id: currentGroceryItem.product_id } }).exec();
            product = doc ? doc.toJSON() as ProductDocType : null;
          }
          setProductName(product?.name || '');
          setBarcode(product?.barcode || '');
          setManualFields({
            productBrand: product?.brand || '',
            unit: product?.unit || '',
            quantity: currentGroceryItem.rest_quantity ? String(currentGroceryItem.rest_quantity) : '',
            buyDate: currentGroceryItem.buy_date || '',
            expirationDate: currentGroceryItem.expiration_date || '',
            notes: currentGroceryItem.notes || ''
          });
          setContainer(currentGroceryItem.container_id ? containerOptions.find(c => c.id === currentGroceryItem.container_id) || null : null);
          // Load product group for info
          if (product?.product_group_id && db && db.collections.product_group) {
            const doc = await db.collections.product_group.findOne({ selector: { id: product.product_group_id } }).exec();
            setProductGroup(doc ? doc.toJSON() as ProductGroupDocType : null);
          } else {
            setProductGroup(null);
          }
        })();
      }
    }
  }, [open, currentGroceryItem?.id, containerOptions, db]); // Use currentGroceryItem.id to avoid object reference issues

  const handleManualFieldChange = (field: string, value: string) => {
    const newManualFields = { ...manualFields, [field]: value };
    setManualFields(newManualFields);
    
    // Save to itemsData immediately to persist changes
    if (currentGroceryItem) {
      setItemsData(prev => {
        const newMap = new Map(prev);
        const existingData = newMap.get(currentGroceryItem.id) || {};
        newMap.set(currentGroceryItem.id, {
          ...existingData,
          manualFields: newManualFields
        });
        return newMap;
      });
    }
  };

  // Chevron navigation functions
  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const handleContainerChange = (newContainer: ContainerDocType | null) => {
    setContainer(newContainer);
    
    // Save to itemsData immediately to persist changes
    if (currentGroceryItem) {
      setItemsData(prev => {
        const newMap = new Map(prev);
        const existingData = newMap.get(currentGroceryItem.id) || {};
        newMap.set(currentGroceryItem.id, {
          ...existingData,
          container: newContainer
        });
        return newMap;
      });
    }
  };

  const handleSave = async () => {
    // Update only editable fields
    const updatedFields: Partial<GroceryItemDocType> = {
      rest_quantity: manualFields.quantity ? Number(manualFields.quantity) : currentGroceryItem.rest_quantity,
      buy_date: manualFields.buyDate || currentGroceryItem.buy_date,
      expiration_date: manualFields.expirationDate || currentGroceryItem.expiration_date,
      notes: manualFields.notes || currentGroceryItem.notes,
      container_id: container ? container.id : currentGroceryItem.container_id,
      updated_at: new Date().toISOString(),
    };
    await updateGroceryItem(currentGroceryItem.id, updatedFields);
    if (onSaved) onSaved();
    onClose();
  };

  const handleCancel = () => {
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth
      slotProps={{
        paper: {
          sx: {
            overflow: 'visible'
          }
        }
      }}
    >
      <Box sx={{ position: 'relative' }}>
        {/* Left Chevron - Desktop only, multiple items only */}
        {isDesktop && groceryItems.length > 1 && (
          <IconButton
            onClick={scrollPrev}
            sx={{ 
              position: 'absolute',
              left: -56,
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: theme.zIndex.modal + 1,
              bgcolor: 'background.paper',
              boxShadow: theme.shadows[2],
              '&:hover': { bgcolor: 'background.paper' }
            }}
          >
            <ChevronLeft />
          </IconButton>
        )}

        {/* Right Chevron - Desktop only, multiple items only */}
        {isDesktop && groceryItems.length > 1 && (
          <IconButton
            onClick={scrollNext}
            sx={{ 
              position: 'absolute',
              right: -56,
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: theme.zIndex.modal + 1,
              bgcolor: 'background.paper',
              boxShadow: theme.shadows[2],
              '&:hover': { bgcolor: 'background.paper' }
            }}
          >
            <ChevronRight />
          </IconButton>
        )}

        <DialogTitle>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {/* Title Row */}
          <Box sx={{ textAlign: 'center' }}>
            {t('groceryItem.edit', 'Edit Grocery Item')}
          </Box>
          
          {/* Dots Row - Only show if multiple items */}
          {groceryItems.length > 1 && (
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'center',
              gap: 1.5,
              width: '100%'
            }}>
              {groceryItems.map((_, index) => (
                <Box
                  key={index}
                  onClick={() => emblaApi?.scrollTo(index)}
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    backgroundColor: currentIndex === index ? 'primary.main' : 'grey.300',
                    transition: 'background-color 0.3s',
                    cursor: 'pointer',
                    '&:hover': {
                      backgroundColor: currentIndex === index ? 'primary.main' : 'grey.400'
                    }
                  }}
                />
              ))}
            </Box>
          )}
        </Box>
      </DialogTitle>
      <DialogContent  sx={{ pb: 1 }}>
        <Box display="flex" flexDirection="column" gap={1} mt={2}>
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
          <div className="embla" ref={emblaRef} style={{ paddingTop: '8px' }}>
            <div className="embla__container">
              {groceryItems.map((item, index) => (
                <div key={item.id} className="embla__slide">
                  {/* Only render form fields for the current active slide */}
                  {index === currentIndex && (
                    <>
                      <Box display="flex" flexDirection="column" gap={2}>
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
                            value={currentGroceryItem.rest_quantity ? currentGroceryItem.rest_quantity : ''}
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
                          onChange={(_, value) => handleContainerChange(value)}
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
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
          
          
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
      </Box>
    </Dialog>
  );
};

export default GroceryItemEditDialog;
