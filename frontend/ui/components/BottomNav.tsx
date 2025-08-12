import React from 'react';
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import ListAltIcon from '@mui/icons-material/ListAlt';
import ImportExportIcon from '@mui/icons-material/ImportExport';
import KitchenIcon from '@mui/icons-material/Kitchen';
import Paper from '@mui/material/Paper';

export interface BottomNavProps {
  value: number;
  onChange: (event: React.SyntheticEvent, newValue: number) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ value, onChange }) => (
  <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0 }} elevation={3}>
    <BottomNavigation value={value} onChange={onChange} showLabels>
      <BottomNavigationAction label="Shopping Lists" icon={<ListAltIcon />} />
      <BottomNavigationAction label="CookieDoo Import" icon={<ImportExportIcon />} />
      <BottomNavigationAction label="Pantry Overview" icon={<KitchenIcon />} />
    </BottomNavigation>
  </Paper>
);
