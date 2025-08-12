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

const SunIcon = (props: any & { mode?: 'light' | 'dark' }) => {
  const theme = useTheme();
  const { mode, ...rest } = props;
  // Sun is bright (secondary) in light mode, faded (primary) in dark mode
  const color = mode === 'light' ? theme.palette.secondary.main : theme.palette.primary.main;
  return <Brightness7Icon sx={{ color, fontSize: 20, ...props?.sx }} {...rest} />;
};

const MoonIcon = (props: any & { mode?: 'light' | 'dark' }) => {
  const theme = useTheme();
  const { mode, ...rest } = props;
  // Moon is secondary in dark mode, primary in light mode
  const color = mode === 'dark' ? theme.palette.secondary.main : theme.palette.secondary.main;
  // Force fill color for SVG path (sometimes MUI icons use fill instead of color)
  return <Brightness2Icon sx={{ color, fill: color, fontSize: 20, ...props?.sx }} {...rest} />;
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
    border: `2px solid ${theme.palette.primary.main}`,
  },
  '& .MuiSwitch-track': {
    borderRadius: 20 / 2,
    backgroundColor: theme.palette.secondary.main,
    opacity: 1,
    border: `2px solid ${theme.palette.primary.main}`,
  },
}));

export function ThemeToggle({ mode, onToggle }: ThemeToggleProps) {
  const { t } = useTranslation();
  return (
    <Box display="flex" alignItems="center" gap={1}>
      <SunIcon mode={mode} sx={{ opacity: mode === 'light' ? 1 : 0.5 }} />
      <CustomSwitch
        defaultChecked
        onChange={onToggle}
        inputProps={{ 'aria-label': t(UI_TRANSLATION_KEYS.THEME_TOGGLE, 'Toggle dark and light mode') }}
      />
      <MoonIcon mode={mode} sx={{ opacity: mode === 'dark' ? 1 : 0.5 }} />
    </Box>
  );
}
