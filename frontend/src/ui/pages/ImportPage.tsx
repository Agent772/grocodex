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
} from '@mui/material';
import { ContentPaste as PasteIcon, FileUpload as ImportIcon } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { parseShoppingList, ParsedShoppingListItem } from '../../utils/shoppingListParser';

const ImportPage: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [importText, setImportText] = useState<string>('');
  const [showClipboardPrompt, setShowClipboardPrompt] = useState<boolean>(false);
  const [parsedItems, setParsedItems] = useState<ParsedShoppingListItem[]>([]);

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

  const handleImport = () => {
    if (!importText.trim()) {
      return;
    }
    
    const items = parseShoppingList(importText);
    setParsedItems(items);
    console.log('Parsed items:', items);
  };

  const handleClear = () => {
    setImportText('');
    setParsedItems([]);
  };

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
          p: { xs: 0, md: 3 },
          height: '85vh',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: { xs: 'transparent', md: 'background.paper' }
        }}
      >
        <Typography variant="h5" component="h1" gutterBottom>
          {t('import.title', 'Import Shopping List')}
        </Typography>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
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

        <Box sx={{ position: 'relative', mb: 2, flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          <TextField
            multiline
            fullWidth
            value={importText}
            onChange={(e) => setImportText(e.target.value)}
            placeholder={t('import.placeholder', 'Paste your shopping list here...\n\ne.g.:\n2 Tomaten\n500g Mehl\n1 Packung Butter')}
            variant="outlined"
            sx={{
              height: '100%',
              '& .MuiInputBase-root': {
                fontFamily: 'monospace',
                fontSize: '0.95rem',
                height: '100%',
                alignItems: 'flex-start'
              },
              '& .MuiInputBase-input': {
                height: '100% !important',
                overflow: 'auto !important'
              }
            }}
          />
          
          {navigator.clipboard && (
            <IconButton
              onClick={handlePasteFromClipboard}
              sx={{
                position: 'absolute',
                top: 8,
                right: 24,
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
            disabled={!importText.trim()}
          >
            {t('common.clear', 'Clear')}
          </Button>
          
          <Button
            variant="contained"
            color="primary"
            onClick={handleImport}
            disabled={!importText.trim()}
            startIcon={<ImportIcon />}
          >
            {t('import.importButton', 'Import')}
          </Button>
        </Box>

        {/* Debug view for parsed items */}
        {parsedItems.length > 0 && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Parsed Items ({parsedItems.length})
            </Typography>
            <Paper 
              variant="outlined" 
              sx={{ 
                maxHeight: '300px', 
                overflow: 'auto',
                backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)'
              }}
            >
              <List dense>
                {parsedItems.map((item, index) => (
                  <React.Fragment key={index}>
                    <ListItem>
                      <ListItemText
                        primary={item.name}
                        secondary={
                          <>
                            {item.quantity && item.unit && (
                              <Typography component="span" variant="body2" color="primary">
                                {item.quantity} {item.unit}
                                {item.quantityMin !== undefined && item.quantityMax !== undefined && (
                                  <Typography component="span" variant="body2" color="text.secondary" sx={{ ml: 0.5 }}>
                                    ({item.quantityMin} - {item.quantityMax})
                                  </Typography>
                                )}
                              </Typography>
                            )}
                            {item.category && (
                              <Typography component="span" variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                                • {item.category}
                              </Typography>
                            )}
                          </>
                        }
                      />
                    </ListItem>
                    {index < parsedItems.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </Paper>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default ImportPage;
