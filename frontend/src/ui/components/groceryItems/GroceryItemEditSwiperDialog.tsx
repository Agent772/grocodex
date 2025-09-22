import React, { useCallback, useEffect } from 'react';
import { Dialog, IconButton, Box, useTheme, Paper } from '@mui/material';
import './GroceryItemEditSwiperDialog.css';
import { ChevronLeft, ChevronRight } from '@mui/icons-material';
import useMediaQuery from '@mui/material/useMediaQuery';
import { GroceryItemDocType } from '../../../types/dbCollections';
import GroceryItemEditDialog from './GroceryItemEditDialog';
import useEmblaCarousel from 'embla-carousel-react';

interface GroceryItemEditSwiperDialogProps {
  open: boolean;
  groceryItems: GroceryItemDocType[];
  onClose: () => void;
  onSaved?: () => void;
}

const GroceryItemEditSwiperDialog: React.FC<GroceryItemEditSwiperDialogProps> = ({
  open,
  groceryItems,
  onClose,
  onSaved,
}) => {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('sm'));
  
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: 'center',
    dragFree: false,
  });

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  // Optional: Add keyboard navigation
  useEffect(() => {
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
  }, [open, scrollPrev, scrollNext]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          overflow: 'visible',
          mx: isDesktop ? 7 : 0,
          bgcolor: 'transparent',
          boxShadow: 'none'
        }
      }}
    >
      <Box sx={{ 
          position: 'relative',
          bgcolor: 'transparent'
        }}>
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

        <div className="embla" ref={emblaRef}>
          <div className="embla__container" style={{ display: 'flex', backgroundColor: 'transparent' }}>
            {groceryItems.map((item, index) => (
              <div 
                className="embla__slide" 
                key={`${item.id}-${index}`}
                style={{ flex: '0 0 100%', backgroundColor: 'transparent' }}
              >
                <Paper elevation={1} sx={{ 
                  borderRadius: 1,
                  height: '100%',
                }}>
                  <GroceryItemEditDialog
                    open={true}
                    groceryItem={item}
                    onClose={onClose}
                    onSaved={onSaved}
                    renderInDialog={false}
                  />
                </Paper>
              </div>
            ))}
          </div>
        </div>

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
      </Box>
    </Dialog>
  );
};

export default GroceryItemEditSwiperDialog;