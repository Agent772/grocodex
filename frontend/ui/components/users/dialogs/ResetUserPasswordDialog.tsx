import React from 'react';
import { Dialog, DialogTitle, DialogContent, TextField, Box, Button } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { UI_TRANSLATION_KEYS } from '../../../../types/uiTranslationKeys';

interface ResetUserPasswordDialogProps {
  open: boolean;
  onClose: () => void;
  onResetPassword: (newPassword: string) => void;
}

/**
 * A dialog component for resetting a user's password.
 *
 * @remarks
 * This dialog allows administrators to input a new password for a user and trigger a password reset action.
 * It displays a password input field and provides "Cancel" and "Reset" actions.
 *
 * @param props - The props for the dialog component.
 * @param props.open - Whether the dialog is open.
 * @param props.onClose - Callback invoked when the dialog is closed.
 * @param props.onResetPassword - Callback invoked with the new password when the reset action is triggered.
 *
 * @returns A Material-UI Dialog component for password reset.
 */
const ResetUserPasswordDialog: React.FC<ResetUserPasswordDialogProps> = ({ open, onClose, onResetPassword }) => {
  const { t } = useTranslation();
  const [resetPassword, setResetPassword] = React.useState('');

  const handleReset = () => {
    if (resetPassword) {
      onResetPassword(resetPassword);
      setResetPassword('');
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>{t(UI_TRANSLATION_KEYS.ADMIN_USERS_RESET_PASSWORD, 'Reset Password')}</DialogTitle>
      <DialogContent>
        <TextField
          label={t(UI_TRANSLATION_KEYS.USER_PROFILE_PASSWORD_NEW, 'New Password')}
          type="password"
          value={resetPassword}
          onChange={e => setResetPassword(e.target.value)}
          fullWidth
          sx={{ mb: 2 }}
        />
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
          <Button onClick={onClose}>
            {t(UI_TRANSLATION_KEYS.USER_PROFILE_CANCEL, 'Cancel')}
          </Button>
          <Button
            onClick={handleReset}
            disabled={!resetPassword}
            variant="contained"
          >
            {t(UI_TRANSLATION_KEYS.ADMIN_USERS_RESET_PASSWORD, 'Reset')}
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default ResetUserPasswordDialog;
