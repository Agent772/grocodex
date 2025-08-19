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
  const [name, setName] = React.useState(container?.name || '');
  const [parent, setParent] = React.useState<ContainerDocType | null>(parentContainer || null);
  const [imagePreview, setImagePreview] = useState<string | undefined>(container?.photo_url);
  const [imageBlob, setImageBlob] = useState<Blob | undefined>(undefined);
  const [color, setColor] = useState<string>(container?.ui_color || '#2196f3');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const { addOrUpdateContainer } = useContainerActions();

  // Helper to build breadcrumb label for a container
  const getBreadcrumbLabel = (option: ContainerDocType): string => {
    // Find parent recursively (assumes containerOptions includes all containers)
    let label = option.name;
    let current = option as ContainerDocType;
    const visited = new Set();
    while (current.parent_container_id && !visited.has(current.parent_container_id)) {
      visited.add(current.parent_container_id);
      const parentObj = containerOptions.find(c => c.id === current.parent_container_id);
      if (parentObj) {
        label = parentObj.name + ' > ' + label;
        current = parentObj;
      } else {
        break;
      }
    }
    return label;
  };

  React.useEffect(() => {
    setName(container?.name || '');
    setParent(parentContainer || null);
  }, [container, parentContainer, open]);

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

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={isMobile ? undefined : 'sm'}
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
            ? t(UI_TRANSLATION_KEYS.CONTAINER_EDIT_TITLE, 'Edit Container')
            : parentContainer
            ? t(UI_TRANSLATION_KEYS.CONTAINER_ADD_SUB_TITLE, 'Add Sub-Container')
            : t(UI_TRANSLATION_KEYS.CONTAINER_ADD_TITLE, 'Add New Container')}
        </DialogTitle>
        <DialogContent>
          {/* Top row: Parent container selector */}
          <Box mb={2}>
            <Autocomplete
              options={containerOptions}
              getOptionLabel={getBreadcrumbLabel}
              value={parent}
              onChange={(_, value) => setParent(value)}
              renderInput={params => (
                <TextField
                  {...params}
                  label={t(UI_TRANSLATION_KEYS.CONTAINER_PARENT, 'Parent Container')}
                  variant="standard"
                  sx={{ minWidth: 120 }}
                />
              )}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              fullWidth={isMobile}
              disableClearable={false}
              filterOptions={(options, state) =>
                options.filter(opt => getBreadcrumbLabel(opt).toLowerCase().includes(state.inputValue.toLowerCase()))
              }
              sx={{ minWidth: isMobile ? undefined : 180, width: isMobile ? '100%' : undefined }}
            />
          </Box>
          {/* Next row: Container name */}
          <Box mb={2}>
            <TextField
              autoFocus
              label={t(UI_TRANSLATION_KEYS.CONTAINER_NAME, 'Container Name')}
              value={name}
              onChange={e => setName(e.target.value)}
              variant="standard"
              required
              sx={{ flex: 1, minWidth: 120, width: isMobile ? '100%' : undefined }}
            />
          </Box>
          {/* Next row: Color picker and image upload */}
          <Box display="flex" alignItems="center" gap={2} mb={2}>
            <input
              type="color"
              value={color}
              onChange={event => setColor(event.target.value)}
              style={{ width: 40, height: 40, border: 'none', background: 'none', padding: 0, cursor: 'pointer' }}
              title={t(UI_TRANSLATION_KEYS.CONTAINER_COLOR, 'Container Color')}
            />
            {!imagePreview && (
              <Box display="flex" gap={1}>
                <Tooltip title={t(UI_TRANSLATION_KEYS.UPLOAD_IMAGE, 'Upload Image')}>
                  <IconButton color="secondary" component="span" onClick={() => fileInputRef.current?.click()}>
                    <FileUploadIcon/>
                  </IconButton>
                </Tooltip>
                <Tooltip title={t(UI_TRANSLATION_KEYS.TAKE_PHOTO, 'Take Photo')}>
                  <IconButton color="secondary" component="span" onClick={() => cameraInputRef.current?.click()}>
                    <PhotoCameraIcon/>
                  </IconButton>
                </Tooltip>
              </Box>
            )}
            {imagePreview && (
              <Box position="relative">
                <img src={imagePreview} alt="Container preview" style={{ maxWidth: 64, maxHeight: 64, borderRadius: 8 }} />
                <IconButton
                  size="small"
                  color="error"
                  onClick={handleDeleteImage}
                  sx={{ position: 'absolute', top: 4, right: 4, background: 'rgba(255,255,255,0.7)' }}
                  aria-label={t(UI_TRANSLATION_KEYS.CONTAINER_DELETE_IMAGE, 'Delete Image')}
                >
                  <DeleteIcon/>
                </IconButton>
              </Box>
            )}
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
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} color='inherit'>{t(UI_TRANSLATION_KEYS.COMMON_CANCEL, 'Cancel')}</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary" disabled={!name.trim()}>
            {container ? t(UI_TRANSLATION_KEYS.CONTAINER_SAVE, 'Save') : t(UI_TRANSLATION_KEYS.CONTAINER_ADD, 'Add')}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
};

export default AddContainerDialog;
