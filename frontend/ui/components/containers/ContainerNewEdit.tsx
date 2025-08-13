import React, { useRef, useState } from 'react';
import { compressImage, blobToBase64 } from '../../../utils/imageCompressionHelper';
import { addOrUpdateContainer } from '../../../db/entities/container';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Box, Autocomplete, IconButton, Tooltip } from '@mui/material';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import DeleteIcon from '@mui/icons-material/Delete';
import { useTranslation } from 'react-i18next';

interface ContainerOption {
  id: string;
  name: string;
  parentId?: string;
}

export interface AddContainerDialogProps {
  open: boolean;
  onClose: () => void;
  onSaved?: () => void;
  container?: { id: string; name: string; photo_url?: string };
  parentContainer?: { id: string; name: string };
  containerOptions?: ContainerOption[];
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
  const [parent, setParent] = React.useState<ContainerOption | null>(parentContainer || null);
  const [imagePreview, setImagePreview] = useState<string | undefined>(container?.photo_url);
  const [imageBlob, setImageBlob] = useState<Blob | undefined>(undefined);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Helper to build breadcrumb label for a container
  const getBreadcrumbLabel = (option: ContainerOption): string => {
    // Find parent recursively (assumes containerOptions includes all containers)
    let label = option.name;
    let current = option as any;
    const visited = new Set();
    while (current.parentId && !visited.has(current.parentId)) {
      visited.add(current.parentId);
      const parentObj = containerOptions.find(c => c.id === current.parentId);
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
    };
    await addOrUpdateContainer(newContainer);
    setName('');
    setParent(null);
    setImagePreview(undefined);
    setImageBlob(undefined);
    onClose();
    if (onSaved) onSaved();
  };

  // Helper to show parent breadcrumb
  const parentBreadcrumb = parent ? getBreadcrumbLabel(parent) : '';

  // Delete image handler
  const handleDeleteImage = () => {
    setImagePreview(undefined);
    setImageBlob(undefined);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>
        {container
          ? t('container.editTitle', 'Edit Container')
          : parentContainer
          ? t('container.addSubTitle', 'Add Sub-Container')
          : t('container.addTitle', 'Add New Container')}
      </DialogTitle>
      <DialogContent>
        <Box display="flex" alignItems="center" gap={1} mt={1}>
          <Autocomplete
            options={containerOptions}
            getOptionLabel={getBreadcrumbLabel}
            value={parent}
            onChange={(_, value) => setParent(value)}
            renderInput={params => (
              <TextField
                {...params}
                label={t('container.parent', 'Parent Container')}
                variant="standard"
                sx={{ minWidth: 120 }}
              />
            )}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            fullWidth={false}
            disableClearable={false}
            filterOptions={(options, state) =>
              options.filter(opt => getBreadcrumbLabel(opt).toLowerCase().includes(state.inputValue.toLowerCase()))
            }
            sx={{ minWidth: 180 }}
          />
          <Box fontWeight={500} color="text.secondary">{'>'}</Box>
          <TextField
            autoFocus
            label={t('container.name', 'Container Name')}
            value={name}
            onChange={e => setName(e.target.value)}
            variant="standard"
            required
            sx={{ flex: 1, minWidth: 120 }}
          />
        </Box>
        {!imagePreview && (
          <Box display="flex" justifyContent="flex-end" gap={2} mt={2}>
            <Tooltip title={t('container.uploadImage', 'Upload Image')}>
              <IconButton color="secondary" component="span" onClick={() => fileInputRef.current?.click()}>
                <FileUploadIcon/>
              </IconButton>
            </Tooltip>
            <Tooltip title={t('container.takePhoto', 'Take Photo')}>
              <IconButton color="secondary" component="span" onClick={() => cameraInputRef.current?.click()}>
                <PhotoCameraIcon/>
              </IconButton>
            </Tooltip>
          </Box>
        )}
        {imagePreview && (
          <Box mt={2} display="flex" flexDirection="column" alignItems="center">
            <Box mb={1} position="relative">
              <img src={imagePreview} alt="Container preview" style={{ maxWidth: 180, maxHeight: 120, borderRadius: 8 }} />
              <IconButton
                size="small"
                color="error"
                onClick={handleDeleteImage}
                sx={{ position: 'absolute', top: 4, right: 4, background: 'rgba(255,255,255,0.7)' }}
                aria-label={t('container.deleteImage', 'Delete Image')}
              >
                <DeleteIcon/>
              </IconButton>
            </Box>
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
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color='inherit'>{t('common.cancel', 'Cancel')}</Button>
        <Button onClick={handleSubmit} variant="contained" color="primary" disabled={!name.trim()}>
          {container ? t('container.save', 'Save') : t('container.add', 'Add')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddContainerDialog;
