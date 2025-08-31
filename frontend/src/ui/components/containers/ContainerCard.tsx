import React from 'react';
import { Card, CardContent, Avatar, Typography, Box, Breadcrumbs, Chip } from '@mui/material';
import { useContainer } from '../../../db/hooks/useContainer';
import { useContainerKPIs } from '../../../db/hooks/useContainerKPIs';
import { useTheme } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';


interface ContainerCardProps {
  containerId: string;
}

export const ContainerCard: React.FC<ContainerCardProps> = ({ containerId }) => {
  const { container, breadcrumb } = useContainer(containerId);
  const { childContainerCount, groceryItemCount } = useContainerKPIs(containerId);
  const { t } = useTranslation();
  const theme = useTheme();

  return (
    <Card sx={{ display: 'flex', flexDirection: 'column', borderLeft: `8px solid ${container?.ui_color || theme.palette.primary.main}`, mb: 2, p: 2, borderRadius: 2, boxShadow: 2, width: '100%' }}>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Avatar src={container?.photo_url} sx={{ width: 40, height: 40, mr: 2 }} />
        <Typography variant="h6" sx={{ flexGrow: 1 }}>{container?.name}</Typography>
      </Box>
      <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
        <Typography variant="body2" color="text.secondary">
          {t('container.inside.containers', 'Containers inside:')} <b>{childContainerCount}</b>
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {t('container.inside.groceryItems', 'GroceryItems inside:')} <b>{groceryItemCount}</b>
        </Typography>
      </Box>
    </Card>
  );
};
