import React from 'react';
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import ListAltIcon from '@mui/icons-material/ListAlt';
import ImportExportIcon from '@mui/icons-material/ImportExport';
import KitchenIcon from '@mui/icons-material/Kitchen';
import Paper from '@mui/material/Paper';
import { useTranslation } from 'react-i18next';
import ShelvesIcon from '@mui/icons-material/Shelves';


export interface BottomNavProps {
  value: number;
  onChange: (event: React.SyntheticEvent, newValue: number) => void;
}

/**
 * BottomNav component renders a fixed bottom navigation bar with three navigation actions:
 * Shopping Lists, CookieDoo Import, and Pantry Overview.
 *
 * @param {BottomNavProps} props - The props for the BottomNav component.
 * @param {number} props.value - The currently selected navigation index.
 * @param {(event: React.SyntheticEvent, newValue: number) => void} props.onChange - Callback fired when the navigation value changes.
 *
 */
export const BottomNav: React.FC<BottomNavProps> = ({ value, onChange }) => {
  const { t } = useTranslation();
  return (
    <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0 }} elevation={3}>
      <BottomNavigation value={value} onChange={onChange} showLabels>
        <BottomNavigationAction label={t('nav.shopping_lists', 'Shopping Lists')} icon={<ListAltIcon />} />
        <BottomNavigationAction label={t('nav.cookiedoo_import', 'CookieDoo Import')} icon={<ImportExportIcon />} />
        <BottomNavigationAction label={t('nav.pantry_overview', 'Pantry Overview')} icon={<KitchenIcon />} />
        <BottomNavigationAction label={t('nav.containers', 'Containers')} icon={<ShelvesIcon />} />
      </BottomNavigation>
    </Paper>
  );
};
