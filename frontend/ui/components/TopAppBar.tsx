import React from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';

interface TopAppBarProps {
  onProfileClick: () => void;
}

export const TopAppBar: React.FC<TopAppBarProps> = ({ onProfileClick }) => {
  const theme = useTheme();
  return (
    <AppBar position="fixed" color="default" elevation={1} sx={{ zIndex: theme.zIndex.drawer + 1 }}>
      <Toolbar sx={{ justifyContent: 'space-between', minHeight: 56 }}>
        <Box display="flex" alignItems="center">
          <img src="/logo.svg" alt="Grocodex logo" style={{ width: 36, height: 36 }} />
        </Box>
        <IconButton edge="end" color="inherit" onClick={onProfileClick} aria-label="profile">
          <Avatar alt="User profile" src="/profile.png" sx={{ width: 36, height: 36 }} />
        </IconButton>
      </Toolbar>
    </AppBar>
  );
};
