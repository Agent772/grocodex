import React, { useMemo, useState } from 'react';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { getTheme } from './ui/theme/getTheme';
import { ThemeToggle } from './ui/components/ThemeToggle';
import { TopAppBar } from './ui/components/TopAppBar';
import { BottomNav } from './ui/components/BottomNav';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { I18nextProvider, useTranslation } from 'react-i18next';
import i18n from './i18n';

const DEFAULT_MODE: 'light' | 'dark' = 'dark';

function Logo() {
  return (
    <Box display="flex" justifyContent="center" alignItems="center" mt={2}>
      <img src="/logo.svg" alt="Grocodex logo" style={{ width: 96, height: 96 }} />
    </Box>
  );
}

export default function App() {
  const [mode, setMode] = useState<'light' | 'dark'>(DEFAULT_MODE);
  const [nav, setNav] = useState(0);
  const theme = useMemo(() => getTheme(mode), [mode]);
  const { t } = useTranslation();

  const handleToggleTheme = () => {
    setMode((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const handleProfileClick = () => {
    // TODO: Implement navigation to profile/settings page
    alert('Profile/settings coming soon!');
  };

  let content: React.ReactNode;
  switch (nav) {
    case 0:
      content = <Typography variant="h5" align="center">Shopping Lists (Coming soon)</Typography>;
      break;
    case 1:
      content = <Typography variant="h5" align="center">CookieDoo Import (Coming soon)</Typography>;
      break;
    case 2:
      content = <Typography variant="h5" align="center">Pantry Overview (Coming soon)</Typography>;
      break;
    default:
      content = null;
  }

  return (
    <I18nextProvider i18n={i18n}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <TopAppBar onProfileClick={handleProfileClick} />
        <Box pt={8} pb={8} minHeight="100vh" display="flex" flexDirection="column" alignItems="center" bgcolor={theme.palette.background.default}>
          <Logo />
          <ThemeToggle mode={mode} onToggle={handleToggleTheme} />
          <Typography variant="h3" mt={2} mb={2} align="center">
            Grocodex
          </Typography>
          <Typography variant="h6" align="center" color="text.secondary" mb={2}>
            {t('welcome.subtitle', 'Welcome to your privacy-first grocery inventory app.')}
          </Typography>
          {content}
        </Box>
        <BottomNav value={nav} onChange={(_, v) => setNav(v)} />
      </ThemeProvider>
    </I18nextProvider>
  );
}
