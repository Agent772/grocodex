import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Alert,
  IconButton,
  Typography,
} from '@mui/material';
import {
  ContentPaste as PasteIcon,
  FileUpload as ImportIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { parseShoppingList, ParsedShoppingListItem } from '../../../utils/shoppingListParser';

interface ImportFormProps {
  isMatching: boolean;
  onImportComplete: (items: ParsedShoppingListItem[]) => void;
}

const ImportForm: React.FC<ImportFormProps> = ({
  isMatching,
  onImportComplete,
}) => {
  const { t } = useTranslation();
  const [importText, setImportText] = useState<string>('');
  const [showClipboardPrompt, setShowClipboardPrompt] = useState<boolean>(false);

  // Check clipboard on mount
  useEffect(() => {
    const checkClipboard = async () => {
      if (navigator.clipboard && navigator.clipboard.readText) {
        try {
          const clipboardText = await navigator.clipboard.readText();
          if (clipboardText && clipboardText.trim().length > 0 && !importText) {
            setShowClipboardPrompt(true);
          }
        } catch (error) {
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
    if (!importText.trim()) return;
    
    // Hide clipboard prompt when starting import
    setShowClipboardPrompt(false);
    
    // Parse shopping list and send to parent
    const items = parseShoppingList(importText);
    onImportComplete(items);
  };

  const handleClear = () => {
    setImportText('');
    setShowClipboardPrompt(false);
  };

  return (
    <>
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

      <Box sx={{ position: 'relative', mb: 2, display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
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
              alignItems: 'flex-start',
            },
            '& .MuiInputBase-input': {
              height: '100% !important',
              overflow: 'auto !important',
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
  );
};

export default ImportForm;
