import * as React from 'react';
import EditIcon from '@mui/icons-material/Edit';
import { useTheme } from '@mui/material/styles';

export interface EditIndicatorProps {
  sx?: any;
}

/**
 * Displays a small edit icon indicator, typically used to show that an element is editable.
 *
 * @param sx - Optional style overrides to customize the appearance of the indicator.
 *
 * @example
 * <EditIndicator sx={{ backgroundColor: 'white' }} />
 */
const EditIndicator: React.FC<EditIndicatorProps> = ({ sx }) => {
  const theme = useTheme();
  return (
    <span
      style={{
        position: 'absolute',
        top: 4,
        right: 4,
        borderRadius: '50%',
        padding: 2,
        boxShadow: '0 1px 4px rgba(0,0,0,0.12)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        ...sx,
      }}
    >
      <EditIcon fontSize="small" color="action" opacity={0.6} />
    </span>
  );
};

export default EditIndicator;
