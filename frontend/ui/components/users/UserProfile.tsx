import React, { useState, useRef } from 'react';
import { useUser } from '../../../db/hooks/UserContext';
import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import {
  Card,
  CardContent,
  CardHeader,
  Avatar,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
} from '@mui/material';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import LogoutIcon from '@mui/icons-material/Logout';
import DeleteIcon from '@mui/icons-material/Delete';
import AvatarUpload from './AvatarUpload';
import EditIndicator from './EditIndicator';
import { ThemeToggle } from '../../theme/ThemeToggle';
import { updateTheme } from '../../../db/entities/user';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import ChangePasswordDialog from './dialogs/ChangePasswordDialog';
import DeleteAccountDialog from './dialogs/DeleteAccountDialog';
import AdminUsersDialog from './dialogs/AdminUsersDialog';
import { useTranslation } from 'react-i18next';
import { UI_TRANSLATION_KEYS } from '../../../types/uiTranslationKeys';
import { User } from '../../../types/entities';

/**
 * UserProfile component displays and manages the user's profile information.
 *
 * Features:
 * - Shows user's avatar, username, and account creation date.
 * - Allows editing of username and avatar.
 * - Provides theme toggling (light/dark) and persists the preference.
 * - Enables password change via a dialog.
 * - Supports user logout.
 * - Allows non-admin users to delete their account.
 * - Displays error messages and loading states.
 *
 * Props:
 * @param {() => void} [onClose] - Optional callback to close the profile dialog.
 * @param {'light' | 'dark'} [mode] - Current theme mode.
 * @param {() => void} [onToggleTheme] - Optional callback to toggle theme.
 * @param {(mode: 'light' | 'dark') => void} [setAppTheme] - Optional callback to set the global theme.
 *
 * @returns {JSX.Element} The rendered user profile UI.
 */
export default function UserProfile({ onClose, mode, onToggleTheme, setAppTheme }: { onClose?: () => void, mode?: 'light' | 'dark', onToggleTheme?: () => void, setAppTheme?: (mode: 'light' | 'dark') => void }) {
  const { t } = useTranslation();
  const { user, update, changePassword, logout, deleteAccount, error, loading, theme } = useUser();

  const handleToggleTheme = async () => {
    if (!user) return;
    const newTheme = mode === 'dark' ? 'light' : 'dark';
    await updateTheme(newTheme); // persist to DB
    if (setAppTheme) setAppTheme(newTheme); // update context/global theme
  };
  const [username, setUsername] = useState(user?.username || '');
  const [avatar, setAvatar] = useState<string | undefined>(user?.avatar);
  const [editMode, setEditMode] = useState(false);
  const [pwdDialog, setPwdDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [adminDialog, setAdminDialog] = useState(false);
  const [oldPwd, setOldPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [pwdError, setPwdError] = useState<string | null>(null);
  const [adminUsers, setAdminUsers] = useState<User[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    setUsername(user?.username || '');
    setAvatar(user?.avatar);
  }, [user]);

  // Fetch all users for admin dialog
  React.useEffect(() => {
    if (user?.isAdmin) {
      import('../../../db/entities/user').then(mod => {
        mod.getAllUsers().then(setAdminUsers);
      });
    }
  }, [user, adminDialog]);

  const handleSave = async () => {
    await update(username, avatar);
    setEditMode(false);
  };

  const handlePwdChange = async () => {
    setPwdError(null);
    try {
      await changePassword(oldPwd, newPwd);
      setPwdDialog(false);
      setOldPwd('');
      setNewPwd('');
    } catch (e: any) {
      setPwdError(e?.error || 'ERR_USER_PASSWORD_CHANGE_FAILED');
    }
  };

  const handleLogout = () => {
    logout();
    if (onClose) onClose();
  };

  const handleDelete = async () => {
    await deleteAccount();
    setDeleteDialog(false);
  };

  // Add user logic (uses registerUser, renamed for clarity)
  const handleAddUser = async (username: string, password: string) => {
    try {
      const { registerUser, getAllUsers } = await import('../../../db/entities/user');
      await registerUser(username, password);
      setAdminUsers(await getAllUsers());
    } catch (e) {
      // TODO: handle error, e.g. show snackbar
    }
  };

  // Delete user logic
  const handleDeleteUser = async (id: string) => {
    try {
      const { deleteUser, getAllUsers } = await import('../../../db/entities/user');
      await deleteUser(id);
      setAdminUsers(await getAllUsers());
    } catch (e) {
      // TODO: handle error, e.g. show snackbar
    }
  };

  if (!user) return <Alert severity="info">Not logged in.</Alert>;

  return (
    <Box
      sx={{
        mx: 'auto',
        mt: 4,
        width: '100%',
        maxWidth: { xs: 340, sm: 400, md: 480 },
        minHeight: { xs: 320, sm: 340 },
        p: { xs: 1, sm: 2 },
        margin: 'auto',
      }}
    >
      <Box sx={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
        {onClose && (
          <IconButton onClick={onClose} title={t(UI_TRANSLATION_KEYS.USER_PROFILE_CANCEL, 'Close')} sx={{ position: 'absolute', top: 8, right: 8, zIndex: 2 }}>
            <span style={{ fontSize: 28, fontWeight: 700, lineHeight: 1 }} aria-label={t(UI_TRANSLATION_KEYS.USER_PROFILE_CANCEL, 'Close')}>×</span>
          </IconButton>
        )}
        <AvatarUpload
          avatar={user?.avatar}
          onChange={async (newAvatar: string) => {
            await update(user?.username || '', newAvatar);
          }}
          sx={{ width: 128, height: 128, }}
        />
        {!editMode ? (
          <Box sx={{ position: 'relative', display: 'inline-block', mt: 1, mb: 0.5, cursor: 'pointer', minWidth: 120 }} onClick={() => setEditMode(true)}>
            <Typography variant="h5" align="center">
              {user?.username}
            </Typography>
            <Box sx={{ position: 'absolute', top: '16%', right: 6, transform: 'translateY(-50%) translateX(30%)', zIndex: 1 }}>
              <EditIndicator sx={{ position: 'static', background: 'none', boxShadow: 'none', marginLeft: '-12px' }} />
            </Box>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5, minWidth: 120 }}>
            <TextField
              label={t(UI_TRANSLATION_KEYS.USER_PROFILE_EDIT_USERNAME, 'Username')}
              value={username}
              onChange={e => setUsername(e.target.value)}
              fullWidth
              autoFocus
              sx={{ mr: 1 }}
            />
            <IconButton color="success" onClick={handleSave} sx={{ mr: 0.5 }} title={t(UI_TRANSLATION_KEYS.USER_PROFILE_SAVE, 'Save')}>
              <CheckIcon />
            </IconButton>
            <IconButton color="error" onClick={() => setEditMode(false)} title={t(UI_TRANSLATION_KEYS.USER_PROFILE_CANCEL, 'Cancel')}>
              <CloseIcon />
            </IconButton>
          </Box>
        )}
        <Typography variant="caption" align="center" sx={{ mb: 1 }}>
          {t(UI_TRANSLATION_KEYS.USER_PROFILE_JOINED_LABEL, 'Joined')}: {user?.created_at ? new Date(user.created_at).toLocaleDateString() : ''}
        </Typography>
      </Box>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{t(UI_TRANSLATION_KEYS.USER_PROFILE_ERROR, error)}</Alert>}
      <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="subtitle1">{t(UI_TRANSLATION_KEYS.USER_PROFILE_THEME_LABEL, 'Theme:')}</Typography>
        <ThemeToggle mode={theme} onToggle={handleToggleTheme} />
      </Box>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {user && user.isAdmin && (
          <Button
            variant="outlined"
            color="primary"
            onClick={() => setAdminDialog(true)}
            fullWidth
          >
            {t(UI_TRANSLATION_KEYS.ADMIN_USERS_TITLE, 'Manage Users')}
          </Button>
        )}
        <Button
          variant="outlined"
          color="secondary"
          onClick={() => setPwdDialog(true)}
          fullWidth
        >
          {t(UI_TRANSLATION_KEYS.USER_PROFILE_CHANGE_PASSWORD, 'Change Password')}
        </Button>
        <Button
          variant="outlined"
          color="secondary"
          onClick={handleLogout}
          startIcon={<LogoutIcon />}
          fullWidth
        >
          {t(UI_TRANSLATION_KEYS.USER_PROFILE_LOGOUT, 'Logout')}
        </Button>
        {user && !user.isAdmin && (
          <Button
            variant="contained"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={() => setDeleteDialog(true)}
            fullWidth
          >
            {t(UI_TRANSLATION_KEYS.USER_PROFILE_DELETE_ACCOUNT, 'Delete Account')}
          </Button>
        )}
      </Box>
      <ChangePasswordDialog
        open={pwdDialog}
        onClose={() => setPwdDialog(false)}
        oldPwd={oldPwd}
        newPwd={newPwd}
        pwdError={pwdError}
        setOldPwd={setOldPwd}
        setNewPwd={setNewPwd}
        onChangePassword={handlePwdChange}
      />
      <DeleteAccountDialog
        open={deleteDialog}
        onClose={() => setDeleteDialog(false)}
        onDelete={handleDelete}
      />
      {user && user.isAdmin && (
        <AdminUsersDialog
          open={adminDialog}
          onClose={() => setAdminDialog(false)}
          users={adminUsers.map(u => ({ ...u, isAdmin: !!u.isAdmin }))}
          onDeleteUser={handleDeleteUser}
          onAddUser={handleAddUser}
        />
      )}
    </Box>
  );
}
