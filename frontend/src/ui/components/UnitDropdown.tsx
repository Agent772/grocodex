import React from 'react';
import { TextField, MenuItem } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { UNIT_OPTIONS } from '../../types/unitOptions';
import { getUnitLabel } from '../utils/getUnitLabel';

interface UnitDropdownProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  sx?: any;
  disabled?: boolean;
};

export const UnitDropdown: React.FC<UnitDropdownProps> = ({ value, onChange, label, sx, disabled }) => {
  const { t } = useTranslation();
  return (
    <TextField
      select
      label={getUnitLabel(value, t)}
      value={value}
      onChange={e => onChange(e.target.value)}
      sx={sx}
      disabled={disabled}
    >
      {UNIT_OPTIONS.map(opt => (
        <MenuItem key={opt} value={opt}>
          {getUnitLabel(opt, t)}
        </MenuItem>
      ))}
    </TextField>
  );
};
