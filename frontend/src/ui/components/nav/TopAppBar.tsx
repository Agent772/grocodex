import React from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';

interface TopAppBarProps {
  onProfileClick: () => void;
  onLogoClick?: () => void;
  avatarSrc?: string;
}

/**
 * TopAppBar component renders a fixed application bar at the top of the page.
 * It displays the Grocodex logo, the application title, and a user profile avatar.
 *
 * @param {object} props - The props for TopAppBar.
 * @param {() => void} [props.onProfileClick] - Callback fired when the profile avatar is clicked.
 * @param {() => void} [props.onLogoClick] - Callback fired when the logo is clicked.
 * @param {string} [props.avatarSrc] - The source URL for the user's avatar image.
 *
 * @returns {JSX.Element} The rendered top app bar component.
 */
export const TopAppBar: React.FC<TopAppBarProps> = ({ onProfileClick, onLogoClick, avatarSrc }) => {
  const theme = useTheme();
  return (
    <AppBar position="fixed" color="default" elevation={1} sx={{ zIndex: theme.zIndex.drawer + 1 }}>
      <Toolbar sx={{ minHeight: 56, px: 2 }}>
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
          <IconButton edge="end" color="inherit" onClick={onProfileClick} aria-label="profile">
            <Avatar alt="User profile" src={avatarSrc || "/profile.png"} sx={{ width: 36, height: 36 }} />
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
};
