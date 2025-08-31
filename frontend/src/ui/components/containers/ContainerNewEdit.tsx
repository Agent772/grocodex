import React, { useRef, useState } from 'react';
import { useTheme, useMediaQuery } from '@mui/material';
import { compressImage, blobToBase64 } from '../../../utils/imageCompressionHelper';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Box, Autocomplete, IconButton, Tooltip } from '@mui/material';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import DeleteIcon from '@mui/icons-material/Delete';
import { useTranslation } from 'react-i18next';
import { UI_TRANSLATION_KEYS } from '../../../types/uiTranslationKeys';
import { useContainerActions } from '../../hooks/useContainerActions';
import { ContainerDocType } from '../../../types/dbCollections';
import { getContainerBreadcrumbLabel } from './ContainerBreadcrumbLabel';

export interface AddContainerDialogProps {
  open: boolean;
  onClose: () => void;
  onSaved?: () => void;
  container?: ContainerDocType;
  parentContainer?: ContainerDocType;
  containerOptions?: ContainerDocType[];
}

const AddContainerDialog: React.FC<AddContainerDialogProps> = ({
  open,
  onClose,
  onSaved,
  container,
  parentContainer,
  containerOptions = [],
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const [name, setName] = React.useState(container?.name || '');
  const [parent, setParent] = React.useState<ContainerDocType | null>(parentContainer || null);
  const [imagePreview, setImagePreview] = useState<string | undefined>(container?.photo_url);
  const [imageBlob, setImageBlob] = useState<Blob | undefined>(undefined);
  const [color, setColor] = useState<string>(container?.ui_color || theme.palette.secondary.main);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const { addOrUpdateContainer } = useContainerActions();

  // // Helper to build breadcrumb label for a container
  // const getBreadcrumbLabel = (option: ContainerDocType): string => {
  //   // Find parent recursively (assumes containerOptions includes all containers)
  //   let label = option.name;
  //   let current = option as ContainerDocType;
  //   const visited = new Set();
  //   while (current.parent_container_id && !visited.has(current.parent_container_id)) {
  //     visited.add(current.parent_container_id);
  //     const parentObj = containerOptions.find(c => c.id === current.parent_container_id);
  //     if (parentObj) {
  //       label = parentObj.name + ' > ' + label;
  //       current = parentObj;
  //     } else {
  //       break;
  //     }
  //   }
  //   return label;
  // };

  React.useEffect(() => {
    setName(container?.name || '');
    setParent(parentContainer || null);
  }, [container, parentContainer, open]);

  // Reset form fields when dialog is closed
  React.useEffect(() => {
    if (!open) {
      setName('');
      setParent(null);
      setImagePreview(undefined);
      setImageBlob(undefined);
      setColor(theme.palette.secondary.main);
      if (fileInputRef.current) fileInputRef.current.value = '';
      if (cameraInputRef.current) cameraInputRef.current.value = '';
    }
  }, [open]);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const compressed = await compressImage(file, { maxWidthOrHeight: 800, maxSizeMB: 0.2 });
      setImageBlob(compressed);
      const base64 = await blobToBase64(compressed);
      setImagePreview(base64);
    }
  };

  const handleSubmit = async () => {
    if (!name.trim()) return;
    let photo_url = imagePreview;
    // Build container entity
    const newContainer = {
      id: container?.id || Math.random().toString(36).slice(2, 10),
      name: name.trim(),
      parent_container_id: parent?.id,
      photo_url,
      ui_color: color,
    };
    await addOrUpdateContainer(newContainer);
    setName('');
    setParent(null);
    setImagePreview(undefined);
    setImageBlob(undefined);
    setColor('#2196f3');
    onClose();
    if (onSaved) onSaved();
  };

  // Delete image handler
  const handleDeleteImage = () => {
    setImagePreview(undefined);
    setImageBlob(undefined);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={isMobile ? false : 'sm'}
      fullWidth
      sx={{
        '& .MuiDialog-paper': {
          display: 'flex',
          flexDirection: 'row',
          width: isMobile ? '90vw' : '480px',
          maxWidth: isMobile ? '90vw' : '96vw',
          margin: 0,
          borderRadius: isMobile ? 0 : 2,
          p: 0,
        }
      }}
    >
      {/* Color highlight bar */}
      <Box sx={{ width: 8, bgcolor: color, borderTopLeftRadius: 8, borderBottomLeftRadius: 8 }} />
      <Box sx={{ flex: 1 }}>
        <DialogTitle>
          {container
            ? t('container.edit.title', 'Edit Container')
            : parentContainer
            ? t('container.add.subTitle', 'Add Sub-Container')
            : t('container.add.title', 'Add New Container')}
        </DialogTitle>
        <DialogContent>
          {/* Top row: Color picker and parent container selector */}
          <Box mb={2} display="flex" alignItems="center" gap={2} sx={{ alignItems: 'center' }}>
            <input
              type="color"
              value={color}
              onChange={event => setColor(event.target.value)}
              style={{ width: 40, height: 40, border: 'none', background: 'none', padding: 0, cursor: 'pointer' }}
              title={t('container.uiColor', 'Container UI Color')}
            />
            <Autocomplete
              options={containerOptions}
              getOptionLabel={option => getContainerBreadcrumbLabel(option, containerOptions)}
              value={parent}
              onChange={(_, value) => setParent(value)}
              renderInput={params => (
                <TextField
                  {...params}
                  label={t('container.parent', 'Parent Container')}
                  variant="standard"
                  sx={{ minWidth: isMobile ? undefined : 120, width: isMobile ? '100%' : '100%' }}
                />
              )}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              fullWidth={isMobile}
              disableClearable={false}
              filterOptions={(options, state) =>
                options.filter(opt => getContainerBreadcrumbLabel(opt, containerOptions).toLowerCase().includes(state.inputValue.toLowerCase()))
              }
              sx={{ minWidth: isMobile ? undefined : 180, width: isMobile ? '100%' : '100%', mb: 2 }}
            />
          </Box>
          {/* 2nd row: Container name and image upload/preview */}
          <Box mb={2} display="flex" alignItems="center" gap={2}>
            <TextField
              autoFocus
              label={t('container.name', 'Container Name')}
              value={name}
              onChange={e => setName(e.target.value)}
              variant="standard"
              required
              sx={{ flex: 1, minWidth: isMobile ? undefined : 120, width: isMobile ? '100%' : undefined }}
            />
            {/* Image upload buttons or preview */}
            {!imagePreview ? (
              <Box display="flex" gap={1}>
                <Tooltip title={t('container.tooltip.uploadImage', 'Upload Image')}>
                  <IconButton color="secondary" component="span" onClick={() => fileInputRef.current?.click()}>
                    <FileUploadIcon/>
                  </IconButton>
                </Tooltip>
                <Tooltip title={t('container.tooltip.takePhoto', 'Take Photo')}>
                  <IconButton color="secondary" component="span" onClick={() => cameraInputRef.current?.click()}>
                    <PhotoCameraIcon/>
                  </IconButton>
                </Tooltip>
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                  onChange={handleImageChange}
                />
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  ref={cameraInputRef}
                  style={{ display: 'none' }}
                  onChange={handleImageChange}
                />
              </Box>
            ) : undefined}
          </Box>
          <Box>
            {imagePreview ? (
              <Box position="relative" ml={2} display="flex" justifyContent="center" alignItems="center" width="100%">
                <Box position="relative" display="inline-block">
                  <img src={imagePreview} alt="Container preview" style={{ maxWidth: 180, maxHeight: 140, borderRadius: 8, display: 'block' }} />
                  <IconButton
                    size="small"
                    color="error"
                    onClick={handleDeleteImage}
                    sx={{ position: 'absolute', top: 4, right: 4, background: theme.palette.background.paper, zIndex: 2 }}
                    aria-label={t('aria.deleteImage', 'Delete Image')}
                  >
                    <DeleteIcon/>
                  </IconButton>
                </Box>
              </Box>
          ) : undefined}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} color='inherit'>{t('common.cancel', 'Cancel')}</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary" disabled={!name.trim()}>
            {container ? t('common.save', 'Save') : t('common.add', 'Add')}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
};

export default AddContainerDialog;
