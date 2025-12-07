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
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          '*': {
            // Custom scrollbar for webkit browsers (Chrome, Safari, Edge)
            '&::-webkit-scrollbar': {
              width: '8px',
              height: '8px',
            },
            '&::-webkit-scrollbar-track': {
              backgroundColor: 'transparent',
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)',
              borderRadius: '4px',
              '&:hover': {
                backgroundColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)',
              },
            },
          },
          // Firefox scrollbar styling
          'html': {
            scrollbarWidth: 'thin',
            scrollbarColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.2) transparent' : 'rgba(0, 0, 0, 0.2) transparent',
          },
        },
      },
    },
  });
