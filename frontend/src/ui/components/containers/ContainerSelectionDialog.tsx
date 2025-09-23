import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Box,
  Divider,
  IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import FolderIcon from '@mui/icons-material/Folder';
import HomeIcon from '@mui/icons-material/Home';
import { useTranslation } from 'react-i18next';
import { ContainerDocType } from '../../../types/dbCollections';

export interface ContainerSelectionDialogProps {
  open: boolean;
  onClose: () => void;
  containers: ContainerDocType[];
  onSelectContainer: (containerId: string) => void; // Back to string only
  currentContainerId?: string;
  title?: string;
}

const ContainerSelectionDialog: React.FC<ContainerSelectionDialogProps> = ({
  open,
  onClose,
  containers,
  onSelectContainer,
  currentContainerId,
  title
}) => {
  const { t } = useTranslation();

  // Build container hierarchy
  const buildContainerHierarchy = (parentId: string | null = null, level = 0): React.ReactNode[] => {
    const children = containers
      .filter(c => {
        // Handle both null and undefined as "root level"
        const containerParentId = c.parent_container_id || null;
        const targetParentId = parentId || null;
        return containerParentId === targetParentId;
      })
      .filter(c => c.id !== currentContainerId); // Exclude current container

    return children.map(container => (
      <React.Fragment key={container.id}>
        <ListItem disablePadding>
          <ListItemButton 
            sx={{ pl: 2 + level * 2 }}
            onClick={() => {
              onSelectContainer(container.id);
              onClose();
            }}
          >
            <ListItemIcon>
              <FolderIcon sx={{ color: container.ui_color }} />
            </ListItemIcon>
            <ListItemText 
              primary={container.name}
              secondary={container.description}
            />
          </ListItemButton>
        </ListItem>
        {buildContainerHierarchy(container.id, level + 1)}
      </React.Fragment>
    ));
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      slotProps={{
        paper: {
          sx: { borderRadius: 2 }
        }
      }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box component="span" sx={{ fontWeight: 'medium', fontSize: '1.25rem' }}>
          {title || t('containerSelection.title', 'Select Container')}
        </Box>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent sx={{ p: 0 }}>
        <List sx={{ width: '100%' }}>
          {/* Root option */}
          <ListItem disablePadding>
            <ListItemButton 
              onClick={() => {
                onSelectContainer('root'); // Use 'root' as consistent identifier
                onClose();
              }}
            >
              <ListItemIcon>
                <HomeIcon />
              </ListItemIcon>
              <ListItemText 
                primary={t('container.root', 'Root')}
                secondary={t('containerSelection.rootDescription', 'Move to root level')}
              />
            </ListItemButton>
          </ListItem>
          
          {containers.length > 0 && <Divider />}
          
          {/* Container hierarchy */}
          {buildContainerHierarchy()}
        </List>
        
        {containers.length === 0 && (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography color="text.secondary">
              {t('containerSelection.noContainers', 'No containers available')}
            </Typography>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ContainerSelectionDialog;