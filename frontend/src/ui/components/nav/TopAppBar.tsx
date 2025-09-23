import React from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';

interface TopAppBarProps {
  onLogoClick?: () => void;
}

/**
 * TopAppBar component renders a fixed application bar at the top of the page.
 * It displays the Grocodex logo and the application title.
 *
 * @param {object} props - The props for TopAppBar.
 * @param {() => void} [props.onLogoClick] - Callback fired when the logo is clicked.
 *
 * @returns {JSX.Element} The rendered top app bar component.
 */
export const TopAppBar: React.FC<TopAppBarProps> = (props) => {
  const { onLogoClick } = props;
  const theme = useTheme();
  return (
    <AppBar position="fixed" color="default" elevation={1} sx={{ zIndex: theme.zIndex.drawer + 1 }}>
      <Toolbar sx={{ height: { xs: 56, sm: 56, md: 64 }, px: 2 }}>
        <Box display="flex" alignItems="center" flex={1}>
          <img
            src="/logo.svg"
            alt="Grocodex logo"
            style={{ width: 36, height: 36, cursor: onLogoClick ? 'pointer' : 'default' }}
            onClick={onLogoClick}
          />
        </Box>
        <Box flex={2} display="flex" justifyContent="center" alignItems="center">
          <Typography variant="h6" component="div" sx={{ fontWeight: 700, letterSpacing: 1 }}>
            Grocodex
          </Typography>
        </Box>
        <Box display="flex" alignItems="center" flex={1} justifyContent="flex-end">
          {/* Empty right side for spacing */}
        </Box>
      </Toolbar>
    </AppBar>
  );
};
