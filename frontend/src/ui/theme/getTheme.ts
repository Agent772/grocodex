import { createTheme, Theme } from '@mui/material/styles';

const primaryColor = '#388e3c';
const secondaryColor = '#fbc02d';
const lightBackground = '#f5f5f5';
const darkBackground = '#181a1b';

export const getTheme = (mode: 'light' | 'dark'): Theme =>
  createTheme({
    palette: {
      mode,
      primary: { main: primaryColor },
      secondary: { main: secondaryColor },
      background: {
        default: mode === 'dark' ? darkBackground : lightBackground,
      },
    },
    shape: {
      borderRadius: 8,
    },
    typography: {
      fontFamily: 'Roboto, Arial, sans-serif',
      h1: { fontWeight: 700 },
      h2: { fontWeight: 700 },
      h3: { fontWeight: 700 },
      h4: { fontWeight: 700 },
      h5: { fontWeight: 700 },
      h6: { fontWeight: 700 },
    },
  });
