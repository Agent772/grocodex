import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  TextField,
  Typography,
  Button,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  IconButton,
  InputAdornment,
  Alert,
  Snackbar,
  useMediaQuery
} from '@mui/material';
import { Visibility, VisibilityOff, Save, ArrowBack } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { useAppConfig, useUpdateAppConfig } from '../../db/hooks/logic/appConfigDBHooks';
import { useTranslation } from 'react-i18next';

interface SettingsPageProps {
  onClose?: () => void;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ onClose }) => {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const config = useAppConfig();
  const { updateConfig } = useUpdateAppConfig();

  const [householdName, setHouseholdName] = useState('');
  const [language, setLanguage] = useState('en');
  const [aiToken, setAiToken] = useState('');
  const [showAiToken, setShowAiToken] = useState(false);
  const [isModified, setIsModified] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  // Load config when available
  useEffect(() => {
    if (config) {
      setHouseholdName(config.household_name);
      setLanguage(config.language);
      setAiToken(config.ai_token || '');
    }
  }, [config]);

  // Track modifications
  useEffect(() => {
    if (!config) return;
    
    const modified =
      householdName !== config.household_name ||
      language !== config.language ||
      aiToken !== (config.ai_token || '');
    
    setIsModified(modified);
  }, [householdName, language, aiToken, config]);

  const handleSave = async () => {
    try {
      await updateConfig({
        household_name: householdName,
        language: language,
        ai_token: aiToken || null
      });

      // Update i18n language
      await i18n.changeLanguage(language);

      setSnackbarMessage(t('settings.saveSuccess'));
      setSnackbarOpen(true);
      setIsModified(false);
    } catch (error) {
      console.error('Error saving settings:', error);
      setSnackbarMessage(t('settings.saveError'));
      setSnackbarOpen(true);
    }
  };

  const handleReset = () => {
    if (config) {
      setHouseholdName(config.household_name);
      setLanguage(config.language);
      setAiToken(config.ai_token || '');
      setIsModified(false);
    }
  };

  if (!config) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Typography>{t('common.loading')}</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
        {isMobile && onClose && (
          <IconButton onClick={onClose} aria-label="back">
            <ArrowBack />
          </IconButton>
        )}
        <Typography variant="h4" sx={{ flexGrow: 1 }}>
          {t('settings.title')}
        </Typography>
      </Box>

      <Paper sx={{ p: 3, mt: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Security Notice */}
          <Alert severity="info" variant="outlined">
            {t('settings.securityNotice', 'All settings are stored locally and encrypted. Your AI token is protected using AES-256 encryption and never leaves your device except to sync with your private backend.')}
          </Alert>

          {/* Household Name */}
          <TextField
            label={t('settings.householdName')}
            value={householdName}
            onChange={(e) => setHouseholdName(e.target.value)}
            fullWidth
            helperText={t('settings.householdNameHelper')}
          />

          {/* Language Selection */}
          <FormControl fullWidth>
            <InputLabel>{t('settings.language')}</InputLabel>
            <Select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              label={t('settings.language')}
            >
              <MenuItem value="en">English</MenuItem>
              <MenuItem value="de">Deutsch</MenuItem>
            </Select>
          </FormControl>

          {/* AI Token (Optional) */}
          <TextField
            label={t('settings.aiToken')}
            value={aiToken}
            onChange={(e) => setAiToken(e.target.value)}
            type={showAiToken ? 'text' : 'password'}
            fullWidth
            helperText={t('settings.aiTokenHelper')}
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label={showAiToken ? 'hide token' : 'show token'}
                      onClick={() => setShowAiToken(!showAiToken)}
                      edge="end"
                    >
                      {showAiToken ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }
            }}
          />

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button
              variant="outlined"
              onClick={handleReset}
              disabled={!isModified}
            >
              {t('common.reset')}
            </Button>
            <Button
              variant="contained"
              onClick={handleSave}
              disabled={!isModified}
              startIcon={<Save />}
            >
              {t('common.save')}
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* Success/Error Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity={snackbarMessage.includes('Error') ? 'error' : 'success'}
          variant="filled"
          sx={{ width: '100%' }}
          onClose={() => setSnackbarOpen(false)}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default SettingsPage;
