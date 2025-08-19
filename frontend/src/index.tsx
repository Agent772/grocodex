
import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { ThemeProvider } from '@mui/material/styles';
import { getTheme } from './ui/theme/getTheme';
import { CssBaseline, IconButton } from '@mui/material';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import AppLoaderSimple from './AppLoaderSimple';

const ThemeSwitcher: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setMode] = useState<'light' | 'dark'>('dark');
  const theme = getTheme(mode);
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div style={{ position: 'fixed', top: 8, right: 8, zIndex: 9999 }}>
        <IconButton onClick={() => setMode(mode === 'dark' ? 'light' : 'dark')} color="inherit" size="large">
          {mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
        </IconButton>
      </div>
      {children}
    </ThemeProvider>
  );
};

const container = document.getElementById('root');
const root = createRoot(container!);
let mountCount = 0;
console.log('index mounted', ++mountCount);
root.render(
  // <React.StrictMode>
    <ThemeSwitcher>
      <AppLoaderSimple />
    </ThemeSwitcher>
  // </React.StrictMode>
);
