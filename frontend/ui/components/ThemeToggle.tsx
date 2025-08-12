import React from 'react';
import { styled, useTheme } from '@mui/material/styles';
import Switch from '@mui/material/Switch';
import Box from '@mui/material/Box';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import Brightness2Icon from '@mui/icons-material/Brightness2';
import { useTranslation } from 'react-i18next';
import { UI_TRANSLATION_KEYS } from '../../types/uiTranslationKeys';

interface ThemeToggleProps {
  mode: 'light' | 'dark';
  onToggle: () => void;
}

const SunIcon = (props: any) => {
  const theme = useTheme();
  return <Brightness7Icon sx={{ color: theme.palette.secondary.main, fontSize: 20, ...props?.sx }} {...props} />;
};

const MoonIcon = (props: any) => {
  const theme = useTheme();
  return <Brightness2Icon sx={{ color: theme.palette.primary.main, fontSize: 20, ...props?.sx }} {...props} />;
};

const CustomSwitch = styled(Switch, { shouldForwardProp: (prop) => prop !== 'checked' })(({ theme }) => ({
  width: 56,
  height: 32,
  padding: 7,
  '& .MuiSwitch-switchBase': {
    margin: 1,
    padding: 0,
    transform: 'translateX(6px)',
    '&.Mui-checked': {
      color: theme.palette.getContrastText(theme.palette.background.default),
      transform: 'translateX(24px)',
      '& + .MuiSwitch-track': {
        backgroundColor: theme.palette.primary.main,
        opacity: 1,
      },
    },
  },
  '& .MuiSwitch-thumb': {
    backgroundColor: theme.palette.background.default,
    width: 28,
    height: 28,
    position: 'relative',
  },
  '& .MuiSwitch-track': {
    borderRadius: 20 / 2,
    backgroundColor: theme.palette.secondary.main,
    opacity: 1,
  },
}));

export function ThemeToggle({ mode, onToggle }: ThemeToggleProps) {
  const { t } = useTranslation();
  return (
    <Box display="flex" alignItems="center" gap={1}>
      <SunIcon sx={{ opacity: mode === 'light' ? 1 : 0.5 }} />
      <CustomSwitch
        checked={mode === 'dark'}
        onChange={onToggle}
        inputProps={{ 'aria-label': t(UI_TRANSLATION_KEYS.THEME_TOGGLE, 'Toggle dark and light mode') }}
      />
      <MoonIcon sx={{ opacity: mode === 'dark' ? 1 : 0.5 }} />
    </Box>
  );
}
