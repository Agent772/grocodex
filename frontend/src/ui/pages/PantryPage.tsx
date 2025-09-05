import React, { useState } from 'react';
import { Box, Tabs, Tab } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import LocalDiningIcon from '@mui/icons-material/LocalDining';
import InventoryIcon from '@mui/icons-material/Inventory';
import CategoryIcon from '@mui/icons-material/Category';
import { GroceryOverview } from '../components/groceryItems/GroceryOverview';
import { ContainerOverview } from '../components/containers/ContainerOverview';
import { ProductOverview } from '../components/product/ProductOverview'; // For future use
import { useTranslation } from 'react-i18next';

const PantryPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Box sx={{ width: '100%', height: '100%' }}>
      <Tabs
        value={activeTab}
        onChange={(_, newTab) => setActiveTab(newTab)}
        variant={isMobile ? 'fullWidth' : 'standard'}
        indicatorColor="primary"
        textColor="primary"
        sx={{ mb: 2 }}
        centered={!isMobile}
      >
        <Tab icon={<LocalDiningIcon />} />
        <Tab icon={<InventoryIcon />} />
        <Tab icon={<CategoryIcon />} />
      </Tabs>
      {activeTab === 0 && <GroceryOverview />}
      {activeTab === 1 && <ContainerOverview />}
      {activeTab === 2 && <ProductOverview />}
    </Box>
  );
};

export default PantryPage;
