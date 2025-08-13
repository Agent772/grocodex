import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Alert } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { UI_TRANSLATION_KEYS } from '../../../../types/uiTranslationKeys';

interface ChangePasswordDialogProps {
  open: boolean;
  onClose: () => void;
  oldPwd: string;
  newPwd: string;
  pwdError: string | null;
  setOldPwd: (v: string) => void;
  setNewPwd: (v: string) => void;
  onChangePassword: () => void;
}

const ChangePasswordDialog: React.FC<ChangePasswordDialogProps> = ({
  open,
  onClose,
  oldPwd,
  newPwd,
  pwdError,
  setOldPwd,
  setNewPwd,
  onChangePassword,
}) => {
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
      <DialogTitle>{t(UI_TRANSLATION_KEYS.USER_PROFILE_CHANGE_PASSWORD, 'Change Password')}</DialogTitle>
      <DialogContent>
        {pwdError && <Alert severity="error" sx={{ mb: 2 }}>{t(UI_TRANSLATION_KEYS.USER_PROFILE_ERROR, pwdError)}</Alert>}
        <TextField
          label={t(UI_TRANSLATION_KEYS.USER_PROFILE_PASSWORD_CURRENT, 'Current Password')}
          type="password"
          value={oldPwd}
          onChange={e => setOldPwd(e.target.value)}
          fullWidth
          sx={{ mb: 2 }}
        />
        <TextField
          label={t(UI_TRANSLATION_KEYS.USER_PROFILE_PASSWORD_NEW, 'New Password')}
          type="password"
          value={newPwd}
          onChange={e => setNewPwd(e.target.value)}
          fullWidth
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color='error'>{t(UI_TRANSLATION_KEYS.USER_PROFILE_PASSWORD_CANCEL, 'Cancel')}</Button>
        <Button onClick={onChangePassword} variant="contained" color="primary">{t(UI_TRANSLATION_KEYS.USER_PROFILE_PASSWORD_CHANGE, 'Change')}</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ChangePasswordDialog;
