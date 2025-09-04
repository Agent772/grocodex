import React from 'react';
import { useTranslation } from 'react-i18next';
import { UI_TRANSLATION_KEYS } from '../../../types/uiTranslationKeys';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import ListItemButton from '@mui/material/ListItemButton';
import ListAltIcon from '@mui/icons-material/ListAlt';
import ImportExportIcon from '@mui/icons-material/ImportExport';
import KitchenIcon from '@mui/icons-material/Kitchen';
import Box from '@mui/material/Box';
import ShelvesIcon from '@mui/icons-material/Shelves';

export interface SideDrawerProps {
  open: boolean;
  onClose: () => void;
  onSelect: (index: number) => void;
  selectedIndex: number;
  mini?: boolean;
}

const navItems = [
  { key: 'nav.shopping_lists', icon: <ListAltIcon /> },
  { key: 'nav.cookiedoo_import', icon: <ImportExportIcon /> },
  { key: 'nav.pantry_overview', icon: <KitchenIcon /> },
];

/**
 * Renders a navigation side drawer for the application.
 * 
 * The drawer can be displayed in two modes:
 * - Mini mode: Shows only icons in a compact permanent drawer.
 * - Full mode: Shows icons and labels in a temporary drawer.
 * 
 * @param {object} props - The component props.
 * @param {boolean} props.open - Controls whether the drawer is open (full mode).
 * @param {() => void} props.onClose - Callback fired when the drawer requests to be closed (full mode).
 * @param {(index: number) => void} props.onSelect - Callback fired when a navigation item is selected.
 * @param {number} props.selectedIndex - The index of the currently selected navigation item.
 * @param {boolean} props.mini - If true, renders the drawer in mini mode.
 * 
 * @returns {JSX.Element} The rendered SideDrawer component.
 */
export const SideDrawer: React.FC<SideDrawerProps> = ({ open, onClose, onSelect, selectedIndex, mini }) => {
  const { t } = useTranslation();
  // Height of the app bar (56px default)
  const appBarHeight = 56;
  if (mini) {
    return (
      <Drawer
        anchor="left"
        open
        variant="permanent"
        slotProps={{
          paper: { sx: { width: 64, pt: `${appBarHeight}px`, overflow: 'visible', boxSizing: 'border-box' } }
        }}
      >
        <List>
          {navItems.map((item, idx) => (
            <ListItemButton key={item.key} selected={selectedIndex === idx} onClick={() => onSelect(idx)} sx={{ justifyContent: 'center', px: 0 }}>
              <ListItemIcon sx={{ minWidth: 0 }}>{item.icon}</ListItemIcon>
            </ListItemButton>
          ))}
        </List>
      </Drawer>
    );
  }
  return (
    <Drawer anchor="left" open={open} onClose={onClose} variant="temporary"
     slotProps={{
      paper: { sx: { width: 240, pt: `${appBarHeight}px`, boxSizing: 'border-box' } }
     }}>
      <Box role="presentation">
        <List>
          {navItems.map((item, idx) => (
            <ListItemButton key={item.key} selected={selectedIndex === idx} onClick={() => onSelect(idx)}>
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={t(item.key)} />
            </ListItemButton>
          ))}
        </List>
      </Box>
    </Drawer>
  );
};
