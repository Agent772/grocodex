import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Alert } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { UI_TRANSLATION_KEYS } from '../../../../types/uiTranslationKeys';

interface DeleteAccountDialogProps {
  open: boolean;
  onClose: () => void;
  onDelete: () => void;
}

const DeleteAccountDialog: React.FC<DeleteAccountDialogProps> = ({ open, onClose, onDelete }) => {
  const { t } = useTranslation();
  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="xs"
      PaperProps={{
        sx: {
          m: 1,
          width: '100%',
          maxWidth: { xs: 340, sm: 400 },
        },
      }}
    >
      <DialogTitle>{t(UI_TRANSLATION_KEYS.USER_PROFILE_DELETE_ACCOUNT, 'Delete Account')}</DialogTitle>
      <DialogContent>
        <Alert severity="warning">{t(UI_TRANSLATION_KEYS.USER_PROFILE_DELETE_WARNING, 'This action cannot be undone. Are you sure?')}</Alert>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t(UI_TRANSLATION_KEYS.USER_PROFILE_CANCEL, 'Cancel')}</Button>
        <Button onClick={onDelete} variant="contained" color="error">{t(UI_TRANSLATION_KEYS.USER_PROFILE_DELETE_CONFIRM, 'Delete')}</Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteAccountDialog;
