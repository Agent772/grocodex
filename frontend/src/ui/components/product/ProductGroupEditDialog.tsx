import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, CircularProgress, Box } from '@mui/material';
import { useRxDB } from 'rxdb-hooks';
import { useTranslation } from 'react-i18next';
import { ProductGroupDocType } from '../../../types/dbCollections';

interface ProductGroupEditDialogProps {
  open: boolean;
  productGroupId: string | null;
  onClose: () => void;
  onSaved?: (updatedGroup: ProductGroupDocType) => void;
}

const ProductGroupEditDialog: React.FC<ProductGroupEditDialogProps> = ({ open, productGroupId, onClose, onSaved }) => {
  const db = useRxDB();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');

  useEffect(() => {
    if (!db || !productGroupId || !open) return;
    setLoading(true);
    setError(null);
    db.collections.product_group.findOne(productGroupId).exec()
      .then(doc => {
        if (doc) {
          const data = doc.toJSON();
          setName(data.name || '');
          setBrand(data.brand || '');
        } else {
          setError(t('productGroup.edit.notFound', 'Product group not found'));
        }
      })
      .catch(() => setError(t('productGroup.edit.loadError', 'Error loading product group')))
      .finally(() => setLoading(false));
  }, [db, productGroupId, open, t]);

  const handleSave = async () => {
    if (!db || !productGroupId) return;
    setSaving(true);
    setError(null);
    try {
      const doc = await db.collections.product_group.findOne(productGroupId).exec();
      if (doc) {
        await doc.atomicPatch({ name, brand });
        if (onSaved) onSaved(doc.toJSON());
        onClose();
      } else {
        setError(t('productGroup.edit.notFound', 'Product group not found'));
      }
    } catch (e) {
      setError(t('productGroup.edit.saveError', 'Error saving changes'));
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    if (!saving) onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle>{t('productGroup.edit.title', 'Edit Product Group')}</DialogTitle>
      <DialogContent>
        {loading ? (
          <Box sx={{ textAlign: 'center', py: 2 }}><CircularProgress size={24} /></Box>
        ) : error ? (
          <Box sx={{ color: 'error.main', py: 2 }}>{error}</Box>
        ) : (
          <>
            <TextField
              label={t('productGroup.edit.name', 'Name')}
              value={name}
              onChange={e => setName(e.target.value)}
              fullWidth
              margin="normal"
              autoFocus
              required
            />
            <TextField
              label={t('productGroup.edit.brand', 'Brand')}
              value={brand}
              onChange={e => setBrand(e.target.value)}
              fullWidth
              margin="normal"
              required
            />
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={saving}>{t('common.cancel', 'Cancel')}</Button>
        <Button onClick={handleSave} disabled={saving || loading || !!error} variant="contained" color="primary">
          {saving ? <CircularProgress size={18} /> : t('common.save', 'Save')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProductGroupEditDialog;
