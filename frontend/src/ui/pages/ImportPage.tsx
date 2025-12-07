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
} from '@mui/material';
import { ContentPaste as PasteIcon, FileUpload as ImportIcon } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

const ImportPage: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [importText, setImportText] = useState<string>('');
  const [showClipboardPrompt, setShowClipboardPrompt] = useState<boolean>(false);

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
    
    // TODO: Import logic will be implemented in the next step
    console.log('Import triggered with text:', importText);
  };

  const handleClear = () => {
    setImportText('');
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
      </Paper>
    </Container>
  );
};

export default ImportPage;
