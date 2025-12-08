import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Typography,
  Chip,
  Card,
  CardContent,
  Stack,
  Collapse,
  List,
  ListItem,
  Divider,
  Select,
  MenuItem,
  FormControl,
} from '@mui/material';
import {
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useRxDB } from 'rxdb-hooks';
import { useTheme, useMediaQuery } from '@mui/material';
import { MatchResult } from '../../../types/importMatching';
import { ProductDocType } from '../../../types/dbCollections';
import MatchReviewDialog from './MatchReviewDialog';
import MatchReviewSwiperDialog from './MatchReviewSwiperDialog';

interface MatchResultsViewProps {
  matchResults: MatchResult[];
  setMatchResults: React.Dispatch<React.SetStateAction<MatchResult[]>>;
  expandedSections: { [key: string]: boolean };
  onClear: () => void;
  onToggleSection: (section: string) => void;
}

const MatchResultsView: React.FC<MatchResultsViewProps> = ({
  matchResults,
  setMatchResults,
  expandedSections,
  onClear,
  onToggleSection,
}) => {
  const { t } = useTranslation();
  const db = useRxDB();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [productQuantities, setProductQuantities] = useState<{ [productId: string]: number }>({});
  const [reviewDialogOpen, setReviewDialogOpen] = useState<boolean>(false);
  const [currentReviewItem, setCurrentReviewItem] = useState<MatchResult | null>(null);

  // Calculate quantities for all product options in match results
  useEffect(() => {
    const calculateQuantities = async () => {
      if (!db || matchResults.length === 0) return;
      
      const quantities: { [productId: string]: number } = {};
      
      // Collect all unique product IDs from results and suggestions
      const productIds = new Set<string>();
      matchResults.forEach(result => {
        if (result.matchedProduct) {
          productIds.add(result.matchedProduct.id);
          quantities[result.matchedProduct.id] = result.totalPantryQuantity;
        }
        result.suggestions?.forEach(product => {
          productIds.add(product.id);
        });
      });
      
      // Calculate quantities for suggestion products
      for (const productId of productIds) {
        if (quantities[productId] === undefined) {
          const groceryItemDocs = await db.collections.grocery_item
            .find({ selector: { product_id: productId } })
            .exec();
          
          const total = groceryItemDocs.reduce((sum: number, doc: any) => {
            const item = doc.toJSON();
            return sum + (item.rest_quantity ?? 0);
          }, 0);
          
          quantities[productId] = total;
        }
      }
      
      setProductQuantities(quantities);
    };
    
    calculateQuantities();
  }, [matchResults, db]);

  const handleProductSelect = async (resultIndex: number, productId: string) => {
    const ambiguousItems = matchResults.filter(r => 
      r.matchType === 'none' || 
      r.confidence < 0.7 || 
      (r.suggestions && r.suggestions.length > 0)
    );
    const result = ambiguousItems[resultIndex];
    
    if (productId === '') {
      // User selected "No match" - keep in same category, just clear match
      const updatedResult: MatchResult = {
        ...result,
        matchedProduct: undefined,
        totalPantryQuantity: 0,
        needsQuantity: result.parsedItem.quantity || 0,
        matchedGroceryItems: [],
      };
      
      setMatchResults(prev => 
        prev.map(r => 
          r.parsedItem === result.parsedItem ? updatedResult : r
        )
      );
    } else {
      // User selected a specific product - need to recalculate quantities
      const selectedProduct = result.suggestions?.find(s => s.id === productId) || 
                            (result.matchedProduct?.id === productId ? result.matchedProduct : undefined);
      
      if (selectedProduct && db) {
        // Keep original suggestions array so dropdown remains populated
        const allSuggestions = [
          result.matchedProduct,
          ...(result.suggestions || [])
        ].filter((p): p is ProductDocType => p !== undefined && p.id !== selectedProduct.id);
        
        // Find all grocery items for the selected product
        const groceryItemDocs = await db.collections.grocery_item
          .find({ selector: { product_id: selectedProduct.id } })
          .exec();
        
        const groceryItems = groceryItemDocs.map((doc: any) => doc.toJSON());
        
        // Calculate total pantry quantity
        let totalPantryQuantity = 0;
        if (groceryItems.length > 0) {
          totalPantryQuantity = groceryItems.reduce((sum: number, item: any) => 
            sum + (item.rest_quantity ?? 0), 0
          );
        }
        
        // Calculate needs
        const needsQuantity = Math.max(0, (result.parsedItem.quantity || 0) - totalPantryQuantity);
        
        const updatedResult: MatchResult = {
          ...result,
          matchedProduct: selectedProduct,
          matchedGroceryItems: groceryItems,
          suggestions: allSuggestions,
          totalPantryQuantity,
          needsQuantity,
        };
        
        setMatchResults(prev => 
          prev.map(r => 
            r.parsedItem === result.parsedItem ? updatedResult : r
          )
        );
      }
    }
  };

  const handleReviewMatch = (result: MatchResult) => {
    if (isMobile) {
      // On mobile, open swiper with all ambiguous items at the clicked item
      const index = ambiguousItems.findIndex(item => item === result);
      setCurrentReviewItem({ ...result, __index: index } as any); // Store index
    } else {
      // On desktop, open single item dialog
      setCurrentReviewItem(result);
    }
    setReviewDialogOpen(true);
  };

  const handleConfirmMatch = async (result: MatchResult, selectedProduct?: ProductDocType) => {
    if (!selectedProduct || !db) return;

    // Find all grocery items for the selected product
    const groceryItemDocs = await db.collections.grocery_item
      .find({ selector: { product_id: selectedProduct.id } })
      .exec();
    
    const groceryItems = groceryItemDocs.map((doc: any) => doc.toJSON());
    
    // Calculate total pantry quantity
    let totalPantryQuantity = 0;
    if (groceryItems.length > 0) {
      totalPantryQuantity = groceryItems.reduce((sum: number, item: any) => 
        sum + (item.rest_quantity ?? 0), 0
      );
    }
    
    // Calculate needs
    const needsQuantity = Math.max(0, (result.parsedItem.quantity || 0) - totalPantryQuantity);

    // Update match result with user selection
    const updatedResults = matchResults.map(r => {
      if (r === result) {
        return {
          ...r,
          validated: true,
          userSelectedProduct: selectedProduct,
          matchedProduct: selectedProduct,
          matchedGroceryItems: groceryItems,
          totalPantryQuantity,
          needsQuantity,
        };
      }
      return r;
    });
    setMatchResults(updatedResults);
  };

  // Group results by status (mutually exclusive categories)
  const ambiguousItems = matchResults.filter(r => 
    r.matchType === 'none' || 
    r.confidence < 0.7 || 
    (r.suggestions && r.suggestions.length > 0)
  );
  
  const inStockItems = matchResults.filter(r => 
    !ambiguousItems.includes(r) && 
    r.matchedProduct && 
    r.needsQuantity <= 0
  );
  
  const outOfStockItems = matchResults.filter(r => 
    !ambiguousItems.includes(r) && 
    r.matchedProduct && 
    r.needsQuantity > 0
  );

  const getProductQuantity = (productId: string): number => {
    return productQuantities[productId] ?? 0;
  };

  return (
    <>
      <Box sx={{ mt: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">
          {t('import.results', 'Match Results')} ({matchResults.length} {t('common.items', 'items')})
        </Typography>
        <Button
          variant="outlined"
          size="small"
          onClick={onClear}
        >
          {t('import.startOver', 'Start Over')}
        </Button>
      </Box>

      {/* Summary Stats */}
      <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap' }}>
        <Chip
          icon={<CheckIcon />}
          label={`${inStockItems.length} ${t('import.inStock', 'In Stock')}`}
          color="success"
          size="small"
        />
        <Chip
          icon={<ErrorIcon />}
          label={`${outOfStockItems.length} ${t('import.outOfStock', 'Out of Stock')}`}
          color="error"
          size="small"
        />
        {ambiguousItems.length > 0 && (
          <Chip
            icon={<WarningIcon />}
            label={`${ambiguousItems.length} ${t('import.needReview', 'Need Review')}`}
            color="default"
            size="small"
          />
        )}
      </Stack>

      {/* Ambiguous/Need Review Items */}
      {ambiguousItems.length > 0 && (
        <Card sx={{ mb: 2, borderLeft: 4, borderColor: 'warning.main' }}>
          <CardContent>
            <Box
              sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
              onClick={() => onToggleSection('ambiguous')}
            >
              <Typography variant="subtitle1" fontWeight="bold">
                ⚠️ {t('import.needReview', 'Need Review')} ({ambiguousItems.length})
              </Typography>
              {expandedSections.ambiguous ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </Box>
            <Collapse in={expandedSections.ambiguous}>
              <List dense>
                {ambiguousItems.map((result, index) => {
                  const hasMultipleOptions = result.suggestions && result.suggestions.length > 0;
                  const allOptions = hasMultipleOptions ? [
                    result.matchedProduct,
                    ...(result.suggestions || [])
                  ].filter(Boolean) as ProductDocType[] : [];
                  
                  return (
                    <React.Fragment key={index}>
                      <ListItem sx={{ py: 2 }}>
                        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'stretch', sm: 'center' }, gap: 2, width: '100%'}}>
                          {/* Left: Imported Item */}
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Box sx={{ display: { xs: 'flex', sm: 'block' }, flexWrap: 'wrap', gap: { xs: 1, sm: 0 }, alignItems: 'baseline' }}>
                              <Typography variant="body1" fontWeight="600" component="span">
                                {result.parsedItem.name}
                              </Typography>
                              <Typography variant="body2" color="text.secondary" component="span" sx={{ whiteSpace: 'nowrap' }}>
                                {result.parsedItem.quantity} {result.parsedItem.unit || 'pcs'}
                              </Typography>
                            </Box>
                          </Box>
                          
                          {/* Middle: Arrow */}
                          <Box sx={{ display: { xs: 'none', sm: 'flex' }, alignItems: 'center', px: 1 }}>
                            <Typography variant="h6" color="warning.main">
                              →
                            </Typography>
                          </Box>
                          
                          {/* Right: Match Result or Dropdown */}
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            {hasMultipleOptions ? (
                              <FormControl fullWidth size="small">
                                <Select
                                  value={result.matchedProduct?.id || ''}
                                  onChange={(e) => handleProductSelect(index, e.target.value)}
                                  displayEmpty
                                  renderValue={(selected) => {
                                    if (!selected) {
                                      return <em>{t('import.noMatch', 'No match')}</em>;
                                    }
                                    const selectedProduct = allOptions.find(p => p.id === selected) || result.matchedProduct;
                                    if (!selectedProduct) return <em>{t('import.noMatch', 'No match')}</em>;
                                    
                                    return (
                                      <Box>
                                        <Typography variant="body1" fontWeight="500" noWrap color="warning.main" component="span">
                                          {selectedProduct.name}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" component="div">
                                          {t('import.inStock', 'In Stock')}: {result.totalPantryQuantity.toFixed(1)} {selectedProduct.unit}
                                        </Typography>
                                      </Box>
                                    );
                                  }}
                                >
                                  <MenuItem value="">
                                    <em>{t('import.noMatch', 'No match')}</em>
                                  </MenuItem>
                                  {allOptions
                                    .sort((a, b) => a.name.localeCompare(b.name))
                                    .map((product) => {
                                      const qty = getProductQuantity(product.id);
                                      return (
                                        <MenuItem key={product.id} value={product.id}>
                                          {product.name} - {qty.toFixed(1)} {product.unit}
                                        </MenuItem>
                                      );
                                    })}
                                </Select>
                              </FormControl>
                            ) : (
                              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'stretch', sm: 'center' }, gap: 1 }}>
                                {result.matchedProduct ? (
                                  <Box sx={{ flex: 1, minWidth: 0 }}>
                                    <Typography variant="body1" fontWeight="500">
                                      {result.matchedProduct.name}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                      {t('import.inStock', 'In Stock')}: {result.totalPantryQuantity.toFixed(1)} {result.matchedProduct.unit}
                                    </Typography>
                                  </Box>
                                ) : (
                                  <Typography variant="body1" fontWeight="500" color="error" sx={{ flex: 1 }}>
                                    {t('import.noMatch', 'No match')}
                                  </Typography>
                                )}
                                <Button
                                  size="small"
                                  variant="outlined"
                                  onClick={() => handleReviewMatch(result)}
                                  sx={{ flexShrink: 0 }}
                                >
                                  {t('import.review', 'Review')}
                                </Button>
                              </Box>
                            )}
                          </Box>
                        </Box>
                      </ListItem>
                      {index < ambiguousItems.length - 1 && <Divider />}
                    </React.Fragment>
                  );
                })}
              </List>
            </Collapse>
          </CardContent>
        </Card>
      )}

      {/* Out of Stock Items */}
      {outOfStockItems.length > 0 && (
        <Card sx={{ mb: 2, borderLeft: 4, borderColor: 'error.main' }}>
          <CardContent>
            <Box
              sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
              onClick={() => onToggleSection('outOfStock')}
            >
              <Typography variant="subtitle1" fontWeight="bold">
                ❌ {t('import.outOfStock', 'Out of Stock')} ({outOfStockItems.length})
              </Typography>
              {expandedSections.outOfStock ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </Box>
            <Collapse in={expandedSections.outOfStock}>
              <List dense>
                {outOfStockItems.map((result, index) => (
                  <React.Fragment key={index}>
                    <ListItem sx={{ py: 2 }}>
                      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'stretch', sm: 'center' }, gap: 2, width: '100%' }}>
                        {/* Left: Imported Item */}
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Box sx={{ display: { xs: 'flex', sm: 'block' }, flexWrap: 'wrap', gap: { xs: 1, sm: 0 }, alignItems: 'baseline' }}>
                            <Typography variant="body1" fontWeight="600" component="span">
                              {result.parsedItem.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" component="span" sx={{ whiteSpace: 'nowrap' }}>
                              {result.parsedItem.quantity} {result.parsedItem.unit || 'pcs'}
                            </Typography>
                          </Box>
                        </Box>
                        
                        {/* Middle: Arrow */}
                        <Box sx={{ display: { xs: 'none', sm: 'flex' }, alignItems: 'center', px: 1 }}>
                          <Typography variant="h6" color="error.main">
                            →
                          </Typography>
                        </Box>
                        
                        {/* Right: Match Result */}
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          {result.matchedProduct ? (
                            <>
                              <Typography variant="body1" fontWeight="500">
                                {result.matchedProduct.name}
                              </Typography>
                              <Typography variant="body2" color="error" fontWeight="600">
                                {t('import.inStock', 'In Stock')}: 0 {result.matchedProduct.unit}
                                <Chip label={`Need: ${result.needsQuantity.toFixed(1)} ${result.matchedProduct.unit}`} size="small" color="error" sx={{ ml: 1, height: 18 }} />
                              </Typography>
                            </>
                          ) : (
                            <>
                              <Typography variant="body1" fontWeight="500" color="text.secondary">
                                {t('import.noProduct', 'No product matched')}
                              </Typography>
                              <Typography variant="body2" color="error" fontWeight="600">
                                {t('import.need', 'Need')}: {result.needsQuantity.toFixed(1)} {result.parsedItem.unit || 'pcs'}
                              </Typography>
                            </>
                          )}
                        </Box>
                      </Box>
                    </ListItem>
                    {index < outOfStockItems.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </Collapse>
          </CardContent>
        </Card>
      )}

      {/* In Stock Items */}
      {inStockItems.length > 0 && (
        <Card sx={{ mb: 2, borderLeft: 4, borderColor: 'success.main' }}>
          <CardContent>
            <Box
              sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
              onClick={() => onToggleSection('inStock')}
            >
              <Typography variant="subtitle1" fontWeight="bold">
                ✅ {t('import.inStock', 'In Stock')} ({inStockItems.length})
              </Typography>
              {expandedSections.inStock ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </Box>
            <Collapse in={expandedSections.inStock}>
              <List dense>
                {inStockItems.map((result, index) => (
                  <React.Fragment key={index}>
                    <ListItem sx={{ py: 2 }}>
                      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'stretch', sm: 'center' }, gap: 2, width: '100%' }}>
                        {/* Left: Imported Item */}
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Box sx={{ display: { xs: 'flex', sm: 'block' }, flexWrap: 'wrap', gap: { xs: 1, sm: 0 }, alignItems: 'baseline' }}>
                            <Typography variant="body1" fontWeight="600" component="span">
                              {result.parsedItem.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" component="span" sx={{ whiteSpace: 'nowrap' }}>
                              {result.parsedItem.quantity} {result.parsedItem.unit || 'pcs'}
                            </Typography>
                          </Box>
                        </Box>
                        
                        {/* Middle: Arrow */}
                        <Box sx={{ display: { xs: 'none', sm: 'flex' }, alignItems: 'center', px: 1 }}>
                          <Typography variant="h6" color="success.main">
                            →
                          </Typography>
                        </Box>
                        
                        {/* Right: Match Result */}
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          {result.matchedProduct ? (
                            <>
                              <Typography variant="body1" fontWeight="500">
                                {result.matchedProduct.name}
                              </Typography>
                              <Typography variant="body2" color="success.main" fontWeight="600">
                                {t('import.inStock', 'In Stock')}: {result.totalPantryQuantity.toFixed(1)} {result.matchedProduct.unit}
                              </Typography>
                            </>
                          ) : (
                            <>
                              <Typography variant="body1" fontWeight="500" color="text.secondary">
                                {t('import.noProduct', 'No product matched')}
                              </Typography>
                              <Typography variant="body2" color="success.main">
                                —
                              </Typography>
                            </>
                          )}
                        </Box>
                      </Box>
                    </ListItem>
                    {index < inStockItems.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </Collapse>
          </CardContent>
        </Card>
      )}
      </Box>

      {/* Review Dialog - Desktop: Single Item, Mobile: Multi-Item Swiper */}
      {isMobile ? (
        <MatchReviewSwiperDialog
          open={reviewDialogOpen}
          matchResults={ambiguousItems}
          initialIndex={(currentReviewItem as any)?.__index || 0}
          onClose={() => setReviewDialogOpen(false)}
          onConfirm={handleConfirmMatch}
        />
      ) : (
        <MatchReviewDialog
          open={reviewDialogOpen}
          matchResult={currentReviewItem}
          onClose={() => setReviewDialogOpen(false)}
          onConfirm={handleConfirmMatch}
        />
      )}
    </>
  );
};

export default MatchResultsView;
