import React from 'react';
import { Dialog, DialogTitle, DialogContent, TextField, Box, Button } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { UI_TRANSLATION_KEYS } from '../../../../types/uiTranslationKeys';

interface AddUserDialogProps {
  open: boolean;
  onClose: () => void;
  onAddUser: (username: string, password: string) => void;
  existingUsernames?: string[];
}

/**
 * A dialog component for adding a new user.
 *
 * Displays input fields for username and password, validates the username against an existing list,
 * and calls the provided `onAddUser` callback when a valid user is added.
 * Shows error messages for duplicate usernames and disables the "Add" button until both fields are filled.
 *
 * @param {AddUserDialogProps} props - The props for the dialog.
 * @param {boolean} props.open - Controls whether the dialog is open.
 * @param {() => void} props.onClose - Callback to close the dialog.
 * @param {(username: string, password: string) => void} props.onAddUser - Callback to add a new user.
 * @param {string[]} [props.existingUsernames] - List of usernames to check for duplicates.
 *
 * @returns {JSX.Element} The rendered dialog component.
 */
const AddUserDialog: React.FC<AddUserDialogProps> = ({ open, onClose, onAddUser, existingUsernames = [] }) => {
  const { t } = useTranslation();
  const [newUsername, setNewUsername] = React.useState('');
  const [newPassword, setNewPassword] = React.useState('');
  const [usernameError, setUsernameError] = React.useState<string | null>(null);

  const handleAdd = () => {
    if (!newUsername) return;
    if (existingUsernames.includes(newUsername.trim())) {
      setUsernameError(t(UI_TRANSLATION_KEYS.USER_PROFILE_ERROR, 'Username already exists'));
      return;
    }
    if (newUsername && newPassword) {
      onAddUser(newUsername, newPassword);
      setNewUsername('');
      setNewPassword('');
      setUsernameError(null);
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>{t(UI_TRANSLATION_KEYS.ADMIN_USERS_ADD, 'Add New User')}</DialogTitle>
      <DialogContent>
        <TextField
          label={t(UI_TRANSLATION_KEYS.USER_PROFILE_USERNAME_LABEL, 'Username')}
          value={newUsername}
          onChange={e => {
            setNewUsername(e.target.value);
            if (usernameError) setUsernameError(null);
          }}
          error={!!usernameError}
          helperText={usernameError}
          fullWidth
          sx={{ mb: 2 }}
        />
        <TextField
          label={t(UI_TRANSLATION_KEYS.USER_PROFILE_PASSWORD_NEW, 'Password')}
          type="password"
          value={newPassword}
          onChange={e => setNewPassword(e.target.value)}
          fullWidth
          sx={{ mb: 2 }}
        />
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
          <Button onClick={onClose} color="inherit">
            {t(UI_TRANSLATION_KEYS.USER_PROFILE_CANCEL, 'Cancel')}
          </Button>
          <Button
            onClick={handleAdd}
            disabled={!newUsername || !newPassword}
            variant="contained"
          >
            {t(UI_TRANSLATION_KEYS.ADMIN_USERS_ADD, 'Add')}
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default AddUserDialog;
