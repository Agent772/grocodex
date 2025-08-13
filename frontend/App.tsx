import React, { useMemo, useState, useEffect } from 'react';
import Dialog from '@mui/material/Dialog';
import UserProfile from './ui/components/users/UserProfile';
import { UserProvider, useUser } from './db/hooks/UserContext';
import LoginPage from './ui/pages/LoginPage';
import { ThemeProvider, CssBaseline, useMediaQuery } from '@mui/material';
import { getTheme } from './ui/theme/getTheme';
import { ThemeToggle } from './ui/components/users/ThemeToggle';
import { TopAppBar } from './ui/components/nav/TopAppBar';
import { BottomNav } from './ui/components/nav/BottomNav';
import { SideDrawer } from './ui/components/nav/SideDrawer';
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

function AppContent() {
  const { theme, setTheme, user, login, loading, error } = useUser();
  const [nav, setNav] = useState(0);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const muiTheme = useMemo(() => getTheme(theme), [theme]);
  const { t } = useTranslation();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('sm'));

  const handleToggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const handleProfileClick = () => {
    setProfileOpen(true);
  };

  const handleLogoClick = () => {
    if (!isMobile) setDrawerOpen(true);
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

  if (!user) {
    return (
      <I18nextProvider i18n={i18n}>
        <ThemeProvider theme={muiTheme}>
          <CssBaseline />
          <LoginPage login={login} loading={loading} error={error} />
        </ThemeProvider>
      </I18nextProvider>
    );
  }
  return (
    <I18nextProvider i18n={i18n}>
      <ThemeProvider theme={muiTheme}>
        <CssBaseline />
        <TopAppBar
          onProfileClick={handleProfileClick}
          onLogoClick={handleLogoClick}
          avatarSrc={user?.avatar}
        />
        {!isMobile && (
          <>
            {!drawerOpen && (
              <SideDrawer
                open={true}
                onClose={() => {}}
                onSelect={(idx) => setNav(idx)}
                selectedIndex={nav}
                mini
              />
            )}
            {drawerOpen && (
              <SideDrawer
                open={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                onSelect={(idx) => { setNav(idx); setDrawerOpen(false); }}
                selectedIndex={nav}
              />
            )}
          </>
        )}
        <Box pt={8} pb={8} minHeight="100vh" display="flex" flexDirection="column" alignItems="center" bgcolor={muiTheme.palette.background.default}>
        <Dialog open={profileOpen} onClose={() => setProfileOpen(false)} maxWidth="xs" fullWidth>
          <UserProfile
            onClose={() => setProfileOpen(false)}
            mode={theme}
            onToggleTheme={handleToggleTheme}
            setAppTheme={setTheme}
          />
        </Dialog>
          <Logo />
          {/* ThemeToggle moved to UserProfile */}
          <Typography variant="h3" mt={2} mb={2} align="center">
            Grocodex
          </Typography>
          <Typography variant="h6" align="center" color="text.secondary" mb={2}>
            {t('welcome.subtitle', 'Welcome to your privacy-first grocery inventory app.')}
          </Typography>
          {content}
        </Box>
        {isMobile && <BottomNav value={nav} onChange={(_, v) => setNav(v)} />}
      </ThemeProvider>
    </I18nextProvider>
  );
}

const App = () => (
  <UserProvider>
    <AppContent />
  </UserProvider>
);

export default App;
