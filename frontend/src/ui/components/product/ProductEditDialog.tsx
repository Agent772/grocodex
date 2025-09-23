import React, { useState, useEffect } from 'react';
import { useRef } from 'react';
import { compressImage, blobToBase64 } from '../../../utils/imageCompressionHelper';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import DeleteIcon from '@mui/icons-material/Delete';
import { Dialog, DialogTitle, DialogContent, DialogActions, Fab, TextField, Box, Autocomplete, MenuItem, IconButton, CircularProgress } from '@mui/material';
import { useRxDB } from 'rxdb-hooks';
import { useProductGroupActions } from '../../hooks/useProductGroupActions';
import { useTranslation } from 'react-i18next';
import { UNIT_OPTIONS } from '../../../types/unitOptions';
import { getUnitLabel } from '../../utils/getUnitLabel';
import BarcodeScannerDialog from '../BarcodeScannerDialog';
import SaveIcon from '@mui/icons-material/Save';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import CloseIcon from '@mui/icons-material/Close';
import { ProductDocType, ProductGroupDocType } from '../../../types/dbCollections';

type ProductGroupOption = ProductGroupDocType | { name: string; isNew: boolean };

interface ProductEditDialogProps {
  open: boolean;
  product?: ProductDocType;
  onClose: () => void;
  onSaved?: () => void;
}

const ProductEditDialog: React.FC<ProductEditDialogProps> = ({ open, product, onClose, onSaved }) => {
  const db = useRxDB();
  const { t } = useTranslation();
  const [productGroupOptions, setProductGroupOptions] = useState<ProductGroupDocType[]>([]);
  const [productGroupInput, setProductGroupInput] = useState('');
  const [productGroup, setProductGroup] = useState<ProductGroupDocType | null>(null);
  const [productName, setProductName] = useState(product?.name || '');
  const [barcode, setBarcode] = useState(product?.barcode || '');
  const [unit, setUnit] = useState(product?.unit || 'g');
  const [quantity, setQuantity] = useState(product?.quantity ? String(product.quantity) : '');
  const [brand, setBrand] = useState(product?.brand || '');
  const [imageUrl, setImageUrl] = useState(product?.image_url || '');
  const [imagePreview, setImagePreview] = useState<string | undefined>(product?.image_url);
  const [imageBlob, setImageBlob] = useState<Blob | undefined>(undefined);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [scanning, setScanning] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!db) return;
    (async () => {
      try {
        const allGroups = db.collections.product_group ? await db.collections.product_group.find().exec() : [];
        setProductGroupOptions(allGroups);
      } catch (e) {
        setProductGroupOptions([]);
      }
    })();
  }, [db]);

  useEffect(() => {
    if (product) {
      setProductName(product.name || '');
      setBarcode(product.barcode || '');
      setUnit(product.unit || 'g');
      setQuantity(product.quantity ? String(product.quantity) : '');
      setBrand(product.brand || '');
      setImageUrl(product.image_url || '');
      setImagePreview(product.image_url);
      setImageBlob(undefined);
      // Set product group
      if (product.product_group_id && productGroupOptions.length > 0) {
        const foundGroup = productGroupOptions.find(pg => pg.id === product.product_group_id);
        if (foundGroup) {
          setProductGroup(foundGroup);
          setProductGroupInput(foundGroup.name);
        }
      }
    }
  }, [product, productGroupOptions]);

  // Product group autocomplete logic
  useEffect(() => {
    if (!productGroupInput || productGroupInput.length < 1) return;
    setProductGroupOptions(prev =>
      prev.filter((g: any) =>
        g.name && g.name.toLowerCase().includes(productGroupInput.toLowerCase())
      )
    );
  }, [productGroupInput]);

  const handleScanBarcode = () => setScanning(true);

  const handleSave = async () => {
    // Find or create product group
    let group = productGroup;
    if (!group && productGroupInput) {
      // Try to find by name
      group = productGroupOptions.find(pg => pg.name === productGroupInput) || null;
      if (!group) {
        // Create new group
        const { addProductGroup } = useProductGroupActions();
        group = await addProductGroup({
          id: crypto.randomUUID(),
          name: productGroupInput,
          brand,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      }
    }
    if (!group) return;
    // Update product
    if (db && product) {
      await db.collections.product.atomicPatch(product.id, {
        name: productName,
        barcode,
        unit,
        quantity: Number(quantity) || 0,
        brand,
        image_url: imagePreview || imageUrl,
        product_group_id: group.id,
        updated_at: new Date().toISOString(),
      });
      if (onSaved) onSaved();
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{t('product.edit.title', 'Edit Product')}</DialogTitle>
      <DialogContent sx={{ pb: 1 }}>
        <Box display="flex" flexDirection="column" gap={2} mt={2}>
          <Autocomplete
            freeSolo
            options={productGroupOptions as (string | ProductGroupOption)[]}
            filterOptions={(options: (string | ProductGroupOption)[], { inputValue }) => {
              const filtered = options.filter((option) => {
                if (typeof option === 'string') {
                  return option.toLowerCase().includes(inputValue.toLowerCase());
                }
                return 'name' in option && option.name && option.name.toLowerCase().includes(inputValue.toLowerCase());
              });
              if (
                inputValue &&
                !filtered.some((option) => {
                  if (typeof option === 'string') {
                    return option.toLowerCase() === inputValue.toLowerCase();
                  }
                  return 'name' in option && option.name.toLowerCase() === inputValue.toLowerCase();
                })
              ) {
                return [...filtered, { name: inputValue, isNew: true }];
              }
              return filtered;
            }}
            getOptionLabel={(option: string | ProductGroupOption) => {
              if (typeof option === 'string') return option;
              return 'name' in option ? option.name : '';
            }}
            inputValue={productGroupInput}
            onInputChange={(_, value) => {
              setProductGroupInput(value);
              setProductGroup(null);
            }}
            onChange={(_, value) => {
              if (typeof value === 'string') {
                setProductGroupInput(value);
                setProductGroup(null);
              } else if (value && typeof value === 'object') {
                if ('isNew' in value && value.isNew) {
                  setProductGroup(null);
                } else {
                  setProductGroup(value as ProductGroupDocType);
                }
                setProductGroupInput('name' in value ? value.name : '');
              }
            }}
            renderOption={(props, option) => {
              if (typeof option === 'string') {
                return <li {...props}>{option}</li>;
              }
              return (
                <li {...props} style={'isNew' in option && option.isNew ? { fontStyle: 'italic', color: '#888' } : {}}>
                  {'name' in option ? option.name : ''}
                  {'isNew' in option && option.isNew ? ` (${t('productGroup.add_new', 'Add new')})` : ''}
                </li>
              );
            }}
            renderInput={params => (
              <TextField
                {...params}
                label={t('productGroup.label', 'Product Group')}
                fullWidth
                required
              />
            )}
            sx={{ mb: 1 }}
          />
          <TextField
            label={t('product.name', 'Product Name')}
            value={productName}
            onChange={e => setProductName(e.target.value)}
            fullWidth
            required
          />
          <Box display="flex" alignItems="center" gap={1}>
            <TextField
              label={t('product.barcode', 'Barcode')}
              value={barcode}
              onChange={e => setBarcode(e.target.value)}
              sx={{ width: '100%' }}
            />
            {loading && barcode ? (
              <CircularProgress size={32} />
            ) : (
              <IconButton color="primary" onClick={handleScanBarcode} disabled={scanning}>
                <QrCodeScannerIcon />
              </IconButton>
            )}
          </Box>
          <TextField
            label={t('product.brand', 'Brand')}
            value={brand}
            onChange={e => setBrand(e.target.value)}
            fullWidth
          />
          {/* Image upload UI from ContainerNewEdit */}
            <Box display="flex" alignItems="center" justifyContent="center" gap={2}>
            {/* Image upload buttons or preview */}
            {!imagePreview ? (
              <Box display="flex" gap={1} justifyContent="center" alignItems="center">
              <IconButton color="secondary" component="span" onClick={() => fileInputRef.current?.click()}>
                <FileUploadIcon/>
              </IconButton>
              <IconButton color="secondary" component="span" onClick={() => cameraInputRef.current?.click()}>
                <PhotoCameraIcon/>
              </IconButton>
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={async (e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const compressed = await compressImage(file, { maxWidthOrHeight: 800, maxSizeMB: 0.2 });
                  setImageBlob(compressed);
                  const base64 = await blobToBase64(compressed);
                  setImagePreview(base64);
                }
                }}
              />
              <input
                type="file"
                accept="image/*"
                capture="environment"
                ref={cameraInputRef}
                style={{ display: 'none' }}
                onChange={async (e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const compressed = await compressImage(file, { maxWidthOrHeight: 800, maxSizeMB: 0.2 });
                  setImageBlob(compressed);
                  const base64 = await blobToBase64(compressed);
                  setImagePreview(base64);
                }
                }}
              />
              </Box>
            ) : undefined}
            </Box>
          <Box>
            {imagePreview ? (
              <Box position="relative" ml={2} display="flex" justifyContent="center" alignItems="center" width="100%">
                <Box position="relative" display="inline-block">
                  <img src={imagePreview} alt="Product preview" style={{ maxWidth: 180, maxHeight: 140, borderRadius: 8, display: 'block' }} />
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => {
                      setImagePreview(undefined);
                      setImageBlob(undefined);
                      setImageUrl('');
                      if (fileInputRef.current) fileInputRef.current.value = '';
                      if (cameraInputRef.current) cameraInputRef.current.value = '';
                    }}
                    sx={{ position: 'absolute', top: 4, right: 4, background: '#fff', zIndex: 2 }}
                    aria-label={t('aria.image.delete', 'Delete Image')}
                  >
                    <DeleteIcon/>
                  </IconButton>
                </Box>
              </Box>
          ) : undefined}
          </Box>
          <Box display="flex" alignItems="center" gap={1}>
            <TextField
              label={t('product.quantity', 'Quantity')}
              value={quantity}
              onChange={e => setQuantity(e.target.value)}
              fullWidth
            />
            <TextField
              select
              label={t('product.unit', 'Unit')}
              value={unit}
              onChange={e => setUnit(e.target.value)}
              sx={{ width: { xs: '20vw', sm: '7vw' } }}
            >
              {UNIT_OPTIONS.map(opt => (
                <MenuItem key={opt} value={opt}>{getUnitLabel(opt, t)}</MenuItem>
              ))}
            </TextField>
          </Box>
        </Box>
        {scanning && (
          <BarcodeScannerDialog
            open={scanning}
            onClose={() => setScanning(false)}
            onScan={(code) => {
              setBarcode(code);
              setScanning(false);
            }}
          />
        )}
      </DialogContent>
      <DialogActions>
        <IconButton onClick={onClose} size="small" color="inherit" aria-label={t('aria.cancel', 'Cancel')}>
          <CloseIcon />
        </IconButton>
        <Fab
          color="primary"
          aria-label={t('aria.save', 'Save')}
          onClick={handleSave}
          size="small"
          disabled={!productName.trim() || !unit.trim() || !quantity.trim()}
          >
            <SaveIcon />
        </Fab>
      </DialogActions>
    </Dialog>
  );
};

export default ProductEditDialog;
