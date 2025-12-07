import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Container,
  Paper,
  TextField,
  Typography,
  Alert,
  IconButton,
  useTheme,
  useMediaQuery,
  List,
  ListItem,
  ListItemText,
  Divider,
  LinearProgress,
  Chip,
  Card,
  CardContent,
  Stack,
  Collapse,
  Select,
  MenuItem,
  FormControl,
} from '@mui/material';
import {
  ContentPaste as PasteIcon,
  FileUpload as ImportIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { parseShoppingList, ParsedShoppingListItem } from '../../utils/shoppingListParser';
import { useImportMatcher } from '../hooks/useImportMatcher';
import { MatchResult, BatchMatchResult } from '../../types/importMatching';
import MatchReviewDialog from '../components/import/MatchReviewDialog';
import { ProductDocType } from '../../types/dbCollections';
import { useRxDB } from 'rxdb-hooks';
import { useAppConfig } from '../../db/hooks/logic/appConfigDBHooks';

const ImportPage: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const db = useRxDB();
  const [importText, setImportText] = useState<string>('');
  const [showClipboardPrompt, setShowClipboardPrompt] = useState<boolean>(false);
  const [parsedItems, setParsedItems] = useState<ParsedShoppingListItem[]>([]);
  const [matchResults, setMatchResults] = useState<MatchResult[]>([]);
  const [isMatching, setIsMatching] = useState<boolean>(false);
  const [matchProgress, setMatchProgress] = useState<number>(0);
  const [reviewDialogOpen, setReviewDialogOpen] = useState<boolean>(false);
  const [currentReviewItem, setCurrentReviewItem] = useState<MatchResult | null>(null);
  const [expandedSections, setExpandedSections] = useState<{ [key: string]: boolean }>({
    inStock: true,
    outOfStock: true,
    ambiguous: true,
    debug: false,
  });
  const [productQuantities, setProductQuantities] = useState<{ [productId: string]: number }>({});

  const config = useAppConfig();
  const fuzzyThreshold = config?.fuzzy_match_threshold ?? 0.7;
  const { matchItemsInBatches } = useImportMatcher({ fuzzyThreshold });

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

  useEffect(() => {
    // Check if clipboard API is available and if we're likely on mobile
    const checkClipboard = async () => {
      if (navigator.clipboard && navigator.clipboard.readText) {
        try {
          // Check if there's text in clipboard
          const clipboardText = await navigator.clipboard.readText();
          if (clipboardText && clipboardText.trim().length > 0 && !importText) {
            setShowClipboardPrompt(true);
          }
        } catch (error) {
          // User might not have granted clipboard permission yet, or it's not available
          console.log('Clipboard access not available or denied');
        }
      }
    };

    checkClipboard();
  }, []);

  const handlePasteFromClipboard = async () => {
    try {
      const clipboardText = await navigator.clipboard.readText();
      setImportText(clipboardText);
      setShowClipboardPrompt(false);
    } catch (error) {
      console.error('Failed to read clipboard:', error);
    }
  };

  const handleImport = async () => {
    if (!importText.trim()) {
      return;
    }
    
    // Hide clipboard prompt when starting import
    setShowClipboardPrompt(false);
    
    // Parse shopping list
    const items = parseShoppingList(importText);
    setParsedItems(items);
    
    // Start matching in batches
    setIsMatching(true);
    setMatchProgress(0);
    setMatchResults([]);
    
    try {
      // Process batches with progress updates
      const allResults: MatchResult[] = [];
      
      for await (const batchResult of matchItemsInBatches(items, 10)) {
        // Add batch results to accumulated results
        allResults.push(...batchResult.results);
        setMatchResults([...allResults]);
        setMatchProgress(batchResult.progress);
        
        // If not the last batch, give UI a moment to update
        if (!batchResult.isComplete) {
          await new Promise(resolve => setTimeout(resolve, 50));
        }
      }
    } catch (error) {
      console.error('Error matching items:', error);
    } finally {
      setIsMatching(false);
      setMatchProgress(1);
    }
  };

  const handleClear = () => {
    setImportText('');
    setParsedItems([]);
    setMatchResults([]);
    setMatchProgress(0);
  };

  const handleReviewMatch = (result: MatchResult) => {
    setCurrentReviewItem(result);
    setReviewDialogOpen(true);
  };

  const handleProductSelect = async (resultIndex: number, productId: string) => {
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

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Group results by status (mutually exclusive categories)
  // Priority order: Need Review > In Stock > Out of Stock
  
  // Need Review: no match, low confidence, or multiple suggestions requiring user selection
  const ambiguousItems = matchResults.filter(r => 
    r.matchType === 'none' || 
    r.confidence < 0.7 || 
    (r.suggestions && r.suggestions.length > 0)
  );
  
  // In Stock: has good match and sufficient quantity (needsQuantity <= 0), not ambiguous
  const inStockItems = matchResults.filter(r => 
    !ambiguousItems.includes(r) && 
    r.matchedProduct && 
    r.needsQuantity <= 0
  );
  
  // Out of Stock: has good match but needs more quantity (needsQuantity > 0), not ambiguous
  const outOfStockItems = matchResults.filter(r => 
    !ambiguousItems.includes(r) && 
    r.matchedProduct && 
    r.needsQuantity > 0
  );

  return (
    <Container 
      maxWidth="md" 
      sx={{ 
        py: { xs: 1, md: 3 },
        px: { xs: 0, md: 0 }
      }}
    >
      <Paper 
        elevation={isMobile ? 0 : 2} 
        sx={{ 
          p: { xs: 2, md: 3 },
          backgroundColor: { xs: 'transparent', md: 'background.paper' }
        }}
      >
        <Typography variant="h5" component="h1" gutterBottom>
          {t('import.title', 'Import Shopping List')}
        </Typography>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {t('import.description', 'Paste your shopping list from Cookidoo or other sources below. Each item should be on a new line.')}
        </Typography>

        {showClipboardPrompt && (
          <Alert 
            severity="info" 
            sx={{ mb: 2 }}
            action={
              <Button color="inherit" size="small" onClick={handlePasteFromClipboard}>
                {t('import.pasteFromClipboard', 'Paste')}
              </Button>
            }
            onClose={() => setShowClipboardPrompt(false)}
          >
            {t('import.clipboardDetected', 'Clipboard content detected. Would you like to paste it?')}
          </Alert>
        )}

        {/* Import Text Area */}
        {matchResults.length === 0 && (
          <>
            <Box sx={{ position: 'relative', mb: 2 }}>
              <TextField
                multiline
                fullWidth
                rows={12}
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                placeholder={t('import.placeholder', 'Paste your shopping list here...\n\ne.g.:\n2 Tomaten\n500g Mehl\n1 Packung Butter')}
                variant="outlined"
                sx={{
                  '& .MuiInputBase-root': {
                    fontFamily: 'monospace',
                    fontSize: '0.95rem',
                  }
                }}
              />
              
              {navigator.clipboard && (
                <IconButton
                  onClick={handlePasteFromClipboard}
                  sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                  }}
                  title={t('import.pasteButton', 'Paste from clipboard')}
                >
                  <PasteIcon />
                </IconButton>
              )}
            </Box>

            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                onClick={handleClear}
                disabled={!importText.trim() || isMatching}
              >
                {t('common.clear', 'Clear')}
              </Button>
              
              <Button
                variant="contained"
                color="primary"
                onClick={handleImport}
                disabled={!importText.trim() || isMatching}
                startIcon={<ImportIcon />}
              >
                {t('import.importButton', 'Import & Match')}
              </Button>
            </Box>
          </>
        )}

        {/* Matching Progress */}
        {isMatching && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {t('import.matching', 'Matching items against pantry inventory...')}
            </Typography>
            <LinearProgress variant="determinate" value={matchProgress * 100} />
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
              {Math.round(matchProgress * 100)}% {t('common.complete', 'complete')}
            </Typography>
          </Box>
        )}

        {/* Match Results */}
        {matchResults.length > 0 && !isMatching && (
          <Box sx={{ mt: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                {t('import.results', 'Match Results')} ({matchResults.length} {t('common.items', 'items')})
              </Typography>
              <Button
                variant="outlined"
                size="small"
                onClick={handleClear}
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
                    onClick={() => toggleSection('ambiguous')}
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
                        // Show review button only when there are NO matches at all (no product, no suggestions)
                        const shouldShowReviewButton = !hasMultipleOptions;
                        
                        // Helper to get quantity for a product option
                        const getProductQuantity = (productId: string): number => {
                          return productQuantities[productId] ?? 0;
                        };
                        
                        return (
                        <React.Fragment key={index}>
                          <ListItem
                            sx={{ py: 2 }}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%'}}>
                              {/* Left: Imported Item */}
                              <Box sx={{ flex: 1, minWidth: 0 }}>
                                <Typography variant="body1" fontWeight="600" noWrap>
                                  {result.parsedItem.name}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  {result.parsedItem.quantity} {result.parsedItem.unit || 'pcs'}
                                </Typography>
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
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'space-between' }}>
                                    {result.matchedProduct ? (
                                      <Box>
                                        <Typography variant="body1" fontWeight="500" noWrap>
                                          {result.matchedProduct.name}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                          {t('import.inStock', 'In Stock')}: {result.totalPantryQuantity.toFixed(1)} {result.matchedProduct.unit}
                                        </Typography>
                                      </Box>
                                    ) : (
                                      <Typography variant="body1" fontWeight="500" color="error">
                                        {t('import.noMatch', 'No match')}
                                      </Typography>
                                    )}
                                    <Button
                                      size="small"
                                      variant="outlined"
                                      onClick={() => handleReviewMatch(result)}
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
                    onClick={() => toggleSection('outOfStock')}
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
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                              {/* Left: Imported Item */}
                              <Box sx={{ flex: 1, minWidth: 0 }}>
                                <Typography variant="body1" fontWeight="600" noWrap>
                                  {result.parsedItem.name}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  {result.parsedItem.quantity} {result.parsedItem.unit || 'pcs'}
                                </Typography>
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
                                    <Typography variant="body1" fontWeight="500" noWrap>
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
                    onClick={() => toggleSection('inStock')}
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
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                              {/* Left: Imported Item */}
                              <Box sx={{ flex: 1, minWidth: 0 }}>
                                <Typography variant="body1" fontWeight="600" noWrap>
                                  {result.parsedItem.name}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  {result.parsedItem.quantity} {result.parsedItem.unit || 'pcs'}
                                </Typography>
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
                                    <Typography variant="body1" fontWeight="500" noWrap>
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

            {/* Debug View removed */}
            {false && (
            <Card sx={{ mt: 2, borderLeft: 4, borderColor: 'info.main' }}>
              <CardContent>
                <Box
                  sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
                  onClick={() => toggleSection('debug')}
                >
                  <Typography variant="subtitle1" fontWeight="bold">
                    🔍 Debug View - Detailed Match Information
                  </Typography>
                  {expandedSections.debug ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </Box>
                <Collapse in={expandedSections.debug}>
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="caption" color="text.secondary" gutterBottom display="block">
                      Check the browser console (F12) for detailed matching logs. Below is a summary of each match:
                    </Typography>
                    <List dense>
                      {matchResults.map((result, index) => (
                        <React.Fragment key={index}>
                          <ListItem sx={{ display: 'block', py: 1.5 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                              <Typography variant="body2" fontWeight="bold">
                                {index + 1}. {result.parsedItem.name}
                              </Typography>
                              <Chip
                                label={result.matchType}
                                size="small"
                                color={
                                  result.matchType === 'exact' ? 'success' :
                                  result.matchType === 'name-unit' ? 'info' :
                                  result.matchType === 'fuzzy' ? 'warning' : 'default'
                                }
                              />
                              <Chip
                                label={`${(result.confidence * 100).toFixed(0)}%`}
                                size="small"
                                variant="outlined"
                              />
                            </Box>
                            <Box sx={{ pl: 2, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                              <Typography variant="caption" color="text.secondary">
                                Parsed: {result.parsedItem.quantity} {result.parsedItem.unit || 'pcs'}
                              </Typography>
                              {result.matchedProduct && (
                                <Typography variant="caption" color="primary">
                                  Matched: {result.matchedProduct.name} ({result.matchedProduct.quantity} {result.matchedProduct.unit})
                                </Typography>
                              )}
                              <Typography variant="caption" color="text.secondary">
                                Pantry: {result.totalPantryQuantity.toFixed(1)} {result.matchedProduct?.unit || result.parsedItem.unit} 
                                {result.matchedGroceryItems && result.matchedGroceryItems.length > 0 && (
                                  <span> across {result.matchedGroceryItems.length} container(s)</span>
                                )}
                              </Typography>
                              <Typography variant="caption" color={result.needsQuantity > 0 ? 'error' : 'success.main'}>
                                Need: {result.needsQuantity.toFixed(1)} {result.matchedProduct?.unit || result.parsedItem.unit}
                              </Typography>
                              {result.suggestions && result.suggestions.length > 0 && (
                                <Typography variant="caption" color="text.secondary">
                                  Suggestions: {result.suggestions.map(s => s.name).join(', ')}
                                </Typography>
                              )}
                            </Box>
                          </ListItem>
                          {index < matchResults.length - 1 && <Divider />}
                        </React.Fragment>
                      ))}
                    </List>
                  </Box>
                </Collapse>
              </CardContent>
            </Card>
            )}
          </Box>
        )}
      </Paper>

      {/* Review Dialog */}
      <MatchReviewDialog
        open={reviewDialogOpen}
        matchResult={currentReviewItem}
        onClose={() => setReviewDialogOpen(false)}
        onConfirm={handleConfirmMatch}
        onSkip={() => setReviewDialogOpen(false)}
      />
    </Container>
  );
};

export default ImportPage;
