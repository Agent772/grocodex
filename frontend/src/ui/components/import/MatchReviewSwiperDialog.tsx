import React, { useCallback, useEffect, useState } from 'react';
import { Dialog, IconButton, Box, useTheme, Paper, Typography, Button } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight } from '@mui/icons-material';
import useMediaQuery from '@mui/material/useMediaQuery';
import { MatchResult } from '../../../types/importMatching';
import { ProductDocType } from '../../../types/dbCollections';
import MatchReviewDialog from './MatchReviewDialog';
import useEmblaCarousel from 'embla-carousel-react';
import '../../components/groceryItems/GroceryItemEditSwiperDialog.css';

interface MatchReviewSwiperDialogProps {
  open: boolean;
  matchResults: MatchResult[];
  initialIndex?: number;
  onClose: () => void;
  onConfirm: (result: MatchResult, selectedProduct?: ProductDocType) => void;
}

const MatchReviewSwiperDialog: React.FC<MatchReviewSwiperDialogProps> = ({
  open,
  matchResults,
  initialIndex = 0,
  onClose,
  onConfirm,
}) => {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('sm'));
  const { t } = useTranslation();
  const [selectedIndex, setSelectedIndex] = useState(initialIndex);
  // Track changes for each item
  const [pendingChanges, setPendingChanges] = useState<Map<MatchResult, ProductDocType | null>>(new Map());
  
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
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

  // Scroll to initial index when dialog opens
  useEffect(() => {
    if (emblaApi && open) {
      emblaApi.scrollTo(initialIndex, true);
      setSelectedIndex(initialIndex);
    }
  }, [emblaApi, open, initialIndex]);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  // Keyboard navigation
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

  const handleChange = (result: MatchResult, selectedProduct: ProductDocType | null) => {
    setPendingChanges(prev => {
      const newMap = new Map(prev);
      // Only track if it's different from original
      const isDifferent = result.matchedProduct?.id !== selectedProduct?.id;
      if (isDifferent) {
        newMap.set(result, selectedProduct);
      } else {
        // Remove if reverted to original
        newMap.delete(result);
      }
      return newMap;
    });
  };

  // Count only dirty changes (different from original)
  const dirtyCount = pendingChanges.size;

  const handleConfirmAll = () => {
    // Apply all pending changes
    pendingChanges.forEach((selectedProduct, result) => {
      onConfirm(result, selectedProduct || undefined);
    });
    setPendingChanges(new Map());
    onClose();
  };

  const handleCancel = () => {
    setPendingChanges(new Map());
    onClose();
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
            mx: isDesktop ? 7 : 0,
            boxShadow: 'none'
          }
        }
      }}
    >
      <Box sx={{ 
          position: 'relative',
        }}>
          <Paper elevation={1} sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            width: '100%',
            gap: 1,
            borderBottomLeftRadius: 0,
            borderBottomRightRadius: 0,
            pt: 1,
          }}>
            <Box sx={{ width: '100%', textAlign: 'center' }}>
              <Typography variant="h6">
                {t('import.reviewMatches', 'Review Matches')}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {selectedIndex + 1} / {matchResults.length}
              </Typography>
            </Box>
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'center',
              gap: 1.5,
              width: '100%',
              pb: 1,
            }}>
              {matchResults.map((_, index) => (
                <Box
                  key={index}
                  onClick={() => emblaApi?.scrollTo(index)}
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
          </Paper>
        {isDesktop && matchResults.length > 1 && (
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
            {matchResults.map((result, index) => (
              <div 
                className="embla__slide" 
                key={`${result.parsedItem.name}-${index}`}
                style={{ flex: '0 0 100%', backgroundColor: 'transparent' }}
              >
                <Paper elevation={1} sx={{ 
                  borderRadius: 1,
                  height: '100%',
                  borderTopLeftRadius: 0,
                  borderTopRightRadius: 0,
                  pb: 0,
                }}>
                  <MatchReviewDialog
                    open={true}
                    matchResult={result}
                    onClose={handleCancel}
                    onConfirm={onConfirm}
                    renderInDialog={false}
                    onChange={handleChange}
                  />
                </Paper>
              </div>
            ))}
          </div>
        </div>

        {isDesktop && matchResults.length > 1 && (
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

        {/* Global Action Buttons */}
        <Paper elevation={1} sx={{ 
          display: 'flex', 
          gap: 2, 
          justifyContent: 'flex-end',
          p: 2,
          borderTopLeftRadius: 0,
          borderTopRightRadius: 0,
          borderBottomLeftRadius: 1,
          borderBottomRightRadius: 1,
        }}>
          <Button onClick={handleCancel} color="inherit">
            {t('common.cancel', 'Cancel')}
          </Button>
          <Button
            onClick={handleConfirmAll}
            variant="contained"
            color="primary"
            disabled={dirtyCount === 0}
          >
            {t('import.confirmChanges', 'Confirm Changes')} {dirtyCount > 0 && `(${dirtyCount})`}
          </Button>
        </Paper>
      </Box>
    </Dialog>
  );
};

export default MatchReviewSwiperDialog;
