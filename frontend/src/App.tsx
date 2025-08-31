import React, { use, useState } from 'react';
import { CssBaseline, useMediaQuery, Box, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { TopAppBar } from './ui/components/nav/TopAppBar';
import { BottomNav } from './ui/components/nav/BottomNav';
import { SideDrawer } from './ui/components/nav/SideDrawer';
import { PantryOverview } from './ui/pages/PantryOverview';
import {ContainerOverview} from './ui/pages/ContainerOverview';
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n';

function AppContent() {
  const [nav, setNav] = useState(0);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

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
      content = <PantryOverview />;
      break;
    case 3:
      content = <ContainerOverview />;
      break;
    default:
      content = null;
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
        <Box pt={8} pb={8} minHeight="100vh" display="flex" flexDirection="column" alignItems="center" bgcolor={theme.palette.background.default}>
          {content}
        </Box>
        {isMobile && <BottomNav value={nav} onChange={(_, v) => setNav(v)} />}
    </I18nextProvider>
  );
}

const App = () => <AppContent />;

export default App;
