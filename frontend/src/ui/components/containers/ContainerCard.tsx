import React from 'react';
import { Card, CardContent, Avatar, Typography, Box, Breadcrumbs, Chip } from '@mui/material';
import { useContainer } from '../../../db/hooks/useContainer';
import { useContainerKPIs } from '../../../db/hooks/useContainerKPIs';
import { useTheme } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import LocalDiningIcon from '@mui/icons-material/LocalDining';
import InventoryIcon from '@mui/icons-material/Inventory';


interface ContainerCardProps {
  containerId: string;
}

export const ContainerCard: React.FC<ContainerCardProps> = ({ containerId }) => {
  const { container, breadcrumb } = useContainer(containerId);
  const { childContainerCount, groceryItemCount } = useContainerKPIs(containerId);
  const { t } = useTranslation();
  const theme = useTheme();

    return (
      <Card sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', borderLeft: `8px solid ${container?.ui_color || theme.palette.primary.main}`, mb: 0, p: 2, borderRadius: 2, boxShadow: 2, width: '100%' }}>
        {/* Avatar column */}
        <Box sx={{ display: 'flex', alignItems: 'center', minWidth: 48, mr: 2 }}>
          <Avatar src={container?.photo_url} sx={{ width: 40, height: 40 }} />
        </Box>
        {/* Name column */}
        <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center' }}>
          <Typography variant="h6">{container?.name}</Typography>
        </Box>
        {/* Icons + numbers column */}
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1, minWidth: 60 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <InventoryIcon fontSize="small" color="action" />
            <Typography variant="body2" color="text.secondary"><b>{childContainerCount}</b></Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <LocalDiningIcon fontSize="small" color="action" />
            <Typography variant="body2" color="text.secondary"><b>{groceryItemCount}</b></Typography>
          </Box>
        </Box>
      </Card>
    );
};
