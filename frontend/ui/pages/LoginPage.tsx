import React, { useState } from 'react';
import { Box, Card, CardContent, TextField, Button, Typography, Alert, CircularProgress } from '@mui/material';
// import { useUser } from '../../db/hooks/useUser';
import { useTranslation } from 'react-i18next';
import { UI_TRANSLATION_KEYS } from '../../types/uiTranslationKeys';

type LoginPageProps = {
  login: (username: string, password: string) => Promise<any>;
  loading: boolean;
  error: string | null;
  onLogin?: () => void;
};

export default function LoginPage({ login, loading, error, onLogin }: LoginPageProps) {
  const { t } = useTranslation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(username, password);
      if (onLogin) onLogin();
    } catch {}
  };

  return (
    <Box minHeight="100vh" display="flex" flexDirection="column" alignItems="center" justifyContent="flex-start" position="relative">
      <Box position="absolute" top="10%" left={0} right={0} display="flex" flexDirection="column" alignItems="center">
        <img src="/logo.svg" alt="Grocodex logo" style={{ width: 150, height: 150 }} />
        <Typography variant="h4" align="center" mt={2} style={{marginTop: 0}}>
          Grocodex
        </Typography>
      </Box>
      <Box display="flex" flex={1} alignItems="center" justifyContent="center" width="100%" minHeight="100vh" px={2}>
        <Card
          sx={{
            width: '100%',
            mx: 'auto',
            maxWidth: { xs: 320, sm: 360, md: 400, lg: 480 },
          }}
        >
          <CardContent>
            <Typography variant="h5" align="center" mb={2}>
              {t(UI_TRANSLATION_KEYS.LOGIN_TITLE, 'Login')}
            </Typography>
            <form onSubmit={handleSubmit}>
              <TextField
                label={t(UI_TRANSLATION_KEYS.USERNAME_LABEL, 'Username')}
                value={username}
                onChange={e => setUsername(e.target.value)}
                fullWidth
                sx={{ mb: 2 }}
                autoFocus
              />
              <TextField
                label={t(UI_TRANSLATION_KEYS.PASSWORD_LABEL, 'Password')}
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                fullWidth
                sx={{ mb: 2 }}
              />
              <Button type="submit" variant="contained" color="primary" fullWidth disabled={loading}>
                {t(UI_TRANSLATION_KEYS.LOGIN_BUTTON, 'Login')}
              </Button>
            </form>
            {loading && <CircularProgress sx={{ mt: 2 }} />}
            {error && <Alert severity="error" sx={{ mt: 2 }}>{t(UI_TRANSLATION_KEYS.ERROR, error)}</Alert>}
            {/* Success message removed; parent will re-render to main app on login */}
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}
