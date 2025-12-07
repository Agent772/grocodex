import React, { use, useState } from 'react';
import { CssBaseline, useMediaQuery, Box, Typography, Button, Snackbar } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { TopAppBar } from './ui/components/nav/TopAppBar';
import { BottomNav } from './ui/components/nav/BottomNav';
import { SideDrawer } from './ui/components/nav/SideDrawer';
import PantryPage from './ui/pages/PantryPage';
import SettingsPage from './ui/pages/SettingsPage';
import ImportPage from './ui/pages/ImportPage';
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n';
import { useLanguageSync } from './ui/hooks/useLanguageSync';

function AppContent() {
  const [nav, setNav] = useState(0);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // Sync i18n language with app config
  useLanguageSync();

  const handleLogoClick = () => {
    if (isMobile) {
      setSettingsOpen(true);
    } else {
      setDrawerOpen(true);
    }
  };

  let content: React.ReactNode;
  
  // Show settings if settings state is open (mobile) or nav is 3 (desktop drawer)
  if (settingsOpen || nav === 3) {
    content = <SettingsPage onClose={() => { setSettingsOpen(false); setNav(2); }} />;
  } else {
    switch (nav) {
      case 0:
        content = <Typography variant="h5" align="center">Shopping Lists (Coming soon)</Typography>;
        break;
      case 1:
        content = <ImportPage />;
        break;
      case 2:
        content = <PantryPage />;
        break;
      default:
        content = null;
    }
  }

  return (
    <I18nextProvider i18n={i18n}>
        <CssBaseline />
        <TopAppBar
          onLogoClick={handleLogoClick}
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
        {isMobile && <BottomNav value={nav} onChange={(_, v) => setNav(v)} />}
        <Box sx={{ mt: { xs: 7, md: 8 }, px: { xs: 2, md: 4 } }}>
          {content}
        </Box>
    </I18nextProvider>
  );
}

const App = () => <AppContent />;

export default App;
