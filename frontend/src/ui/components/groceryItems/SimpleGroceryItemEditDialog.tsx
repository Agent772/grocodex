import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Box, useTheme, Fab } from '@mui/material';
import { Save as SaveIcon, Close as CloseIcon, ChevronLeft, ChevronRight } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import useMediaQuery from '@mui/material/useMediaQuery';
import { GroceryItemDocType } from '../../../types/dbCollections';
import GroceryItemEditDialog from './GroceryItemEditDialog';
import useEmblaCarousel from 'embla-carousel-react';
import './GroceryItemEditSwiperDialog.css';

interface SimpleGroceryItemEditDialogProps {
  open: boolean;
  groceryItems: GroceryItemDocType | GroceryItemDocType[];
  onClose: () => void;
  onSaved?: () => void;
}

const SimpleGroceryItemEditDialog: React.FC<SimpleGroceryItemEditDialogProps> = ({
  open,
  groceryItems,
  onClose,
  onSaved,
}) => {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('sm'));
  const { t } = useTranslation();
  
  // Normalize groceryItems to always be an array
  const itemsArray = Array.isArray(groceryItems) ? groceryItems : [groceryItems];
  const isMultipleItems = itemsArray.length > 1;
  
  const [selectedIndex, setSelectedIndex] = useState(0);
  const saveHandlersRef = useRef<Map<number, () => Promise<void>>>(new Map());
  
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: isMultipleItems,
    align: 'center',
    dragFree: false,
  });

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    return () => {
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi, onSelect]);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  // Keyboard navigation for multiple items
  useEffect(() => {
    if (!isMultipleItems) return;
    
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!open) return;
      
      if (event.key === 'ArrowLeft') {
        scrollPrev();
      } else if (event.key === 'ArrowRight') {
        scrollNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, isMultipleItems, scrollPrev, scrollNext]);

  // Handle save action for current item
  const handleSave = async () => {
    // Call the save handler of the currently active GroceryItemEditDialog
    const currentHandler = saveHandlersRef.current.get(selectedIndex);
    if (currentHandler) {
      await currentHandler();
    }
  };

  // Function to register save handler from child component
  const registerSaveHandler = (index: number) => (handler: () => Promise<void>) => {
    saveHandlersRef.current.set(index, handler);
  };

  // Reset selected index when dialog opens
  useEffect(() => {
    if (open) {
      setSelectedIndex(0);
      if (emblaApi) {
        emblaApi.scrollTo(0, true);
      }
    }
  }, [open, emblaApi]);

  // Handle dots navigation
  const handleDotClick = (index: number) => {
    if (emblaApi) {
      emblaApi.scrollTo(index);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            overflow: 'visible',
            mx: isDesktop && isMultipleItems ? 7 : 0,
            boxShadow: isMultipleItems ? 'none' : undefined
          }
        }
      }}
    >
      {/* Header outside carousel */}
      <DialogTitle sx={{ textAlign: 'center' }}>
        {t('groceryItem.edit.title', 'Edit Grocery Item')}
      </DialogTitle>

      {/* Navigation dots for multiple items */}
      {isMultipleItems && (
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center',
          gap: 1.5,
          pb: 2
        }}>
          {itemsArray.map((_, index) => (
            <Box
              key={index}
              onClick={() => handleDotClick(index)}
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                backgroundColor: selectedIndex === index ? 'primary.main' : 'grey.300',
                transition: 'background-color 0.3s',
                cursor: 'pointer',
                '&:hover': {
                  backgroundColor: selectedIndex === index ? 'primary.main' : 'grey.400'
                }
              }}
            />
          ))}
        </Box>
      )}

      {/* Content area with carousel */}
      <DialogContent sx={{ position: 'relative', p: 0, pb: 1 }}>
        {/* Desktop navigation arrows */}
        {isDesktop && isMultipleItems && (
          <>
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
          </>
        )}

        {/* Carousel or single item */}
        {isMultipleItems ? (
          <div className="embla" ref={emblaRef}>
            <div className="embla__container" style={{ display: 'flex' }}>
              {itemsArray.map((item, index) => (
                <div 
                  className="embla__slide" 
                  key={`${item.id}-${index}`}
                  style={{ flex: '0 0 100%' }}
                >
                  <Box sx={{ px: 3 }}>
                    <GroceryItemEditDialog
                      open={true}
                      groceryItem={item}
                      onClose={() => {}} // Handled by parent
                      onSaved={onSaved}
                      renderInDialog={false}
                      hideHeader={true}
                      onRegisterSaveHandler={registerSaveHandler(index)}
                    />
                  </Box>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <Box sx={{ px: 3 }}>
            <GroceryItemEditDialog
              open={true}
              groceryItem={itemsArray[0]}
              onClose={() => {}} // Handled by parent
              onSaved={onSaved}
              renderInDialog={false}
              hideHeader={true}
              onRegisterSaveHandler={registerSaveHandler(0)}
            />
          </Box>
        )}
      </DialogContent>

      {/* Actions outside carousel */}
      <DialogActions>
        <IconButton onClick={onClose} size="small" color="inherit" aria-label={t('aria.cancel', 'Cancel')}>
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
  );
};

export default SimpleGroceryItemEditDialog;