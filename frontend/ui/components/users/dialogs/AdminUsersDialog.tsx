import React from 'react';
import AddUserDialog from './AddUserDialog';
import ResetUserPasswordDialog from './ResetUserPasswordDialog';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  TextField,
  Box,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import { useTranslation } from 'react-i18next';
import { UI_TRANSLATION_KEYS } from '../../../../types/uiTranslationKeys';
import { adminAddUser } from '../../../../db/entities/user';
import LockResetIcon from '@mui/icons-material/LockReset';

export interface AdminUser {
  id: string;
  username: string;
  isAdmin: boolean;
  created_at?: string;
}

interface AdminUsersDialogProps {
  open: boolean;
  onClose: () => void;
  users: AdminUser[];
  onDeleteUser: (id: string) => void;
  onAddUser: (username: string, password: string) => void;
}

/**
 * Displays a dialog for managing admin users, including listing existing users,
 * adding new users, resetting passwords, and deleting users.
 *
 * @param open - Controls whether the dialog is open.
 * @param onClose - Callback fired when the dialog is requested to be closed.
 * @param users - Array of user objects to display in the table.
 * @param onDeleteUser - Callback fired when a user is deleted.
 * @param onAddUser - Callback fired when a new user is added or a password is reset.
 *
 * Features:
 * - Shows a list of users with their usernames and join dates.
 * - Allows adding new users via a sub-dialog.
 * - Allows resetting passwords for non-admin users.
 * - Allows deleting non-admin users.
 * - Uses translation keys for internationalization.
 */
const AdminUsersDialog: React.FC<AdminUsersDialogProps> = ({ open, onClose, users, onDeleteUser, onAddUser }) => {
  const [confirmDeleteId, setConfirmDeleteId] = React.useState<string | null>(null);
  const { t } = useTranslation();
  const [showAddDialog, setShowAddDialog] = React.useState(false);
  const [resetUserId, setResetUserId] = React.useState<string | null>(null);
  const [userList, setUserList] = React.useState<AdminUser[]>(users);

  React.useEffect(() => {
    setUserList(users);
  }, [users]);

  const handleAdminAddUser = async (username: string, password: string) => {
    await adminAddUser(username, password);
    const { getAllUsers } = await import('../../../../db/entities/user');
    const updatedUsers = await getAllUsers();
    setUserList(updatedUsers.map(u => ({
      ...u,
      isAdmin: !!u.isAdmin
    })));
    if (typeof onAddUser === 'function') onAddUser(username, password);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ pr: 5 }}>
        {t(UI_TRANSLATION_KEYS.ADMIN_USERS_TITLE || 'admin.users.title', 'Manage Users')}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <IconButton
          aria-label={t(UI_TRANSLATION_KEYS.USER_PROFILE_CANCEL, 'Close')}
          onClick={onClose}
          sx={{ position: 'absolute', right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
      </Box>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
          <Button
              variant="contained"
              color="primary"
              onClick={() => setShowAddDialog(true)}
              size='small'
          >
              {t(UI_TRANSLATION_KEYS.ADMIN_USERS_ADD, 'Add User')}
          </Button>
        </Box>
        <AddUserDialog
          open={showAddDialog}
          onClose={() => setShowAddDialog(false)}
          onAddUser={handleAdminAddUser}
          existingUsernames={userList.map(u => u.username)}
        />
        <TableContainer component={Paper} sx={{ mb: 2 }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>{t(UI_TRANSLATION_KEYS.USER_PROFILE_USERNAME_LABEL, 'Username')}</TableCell>
                <TableCell>{t(UI_TRANSLATION_KEYS.USER_PROFILE_JOINED_LABEL, 'Joined')}</TableCell>
                <TableCell align="right">{t(UI_TRANSLATION_KEYS.ADMIN_USERS_ACTIONS, 'Actions')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {userList.map(user => (
                <TableRow key={user.id}>
                  <TableCell>{user.username}{user.isAdmin ? ' (admin)' : ''}</TableCell>
                  <TableCell>{user.created_at ? new Date(user.created_at).toLocaleDateString() : ''}</TableCell>
                  <TableCell align="right">
                    {!user.isAdmin ? (
                      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                        <IconButton color="warning" onClick={() => setResetUserId(user.id)}>
                          <LockResetIcon />
                        </IconButton>
                        <IconButton color="error" onClick={() => setConfirmDeleteId(user.id)}>
                          <DeleteIcon />
                        </IconButton>
                        {/* Delete confirmation dialog */}
                        <Dialog open={!!confirmDeleteId} onClose={() => setConfirmDeleteId(null)}>
                          <DialogTitle>{t(UI_TRANSLATION_KEYS.ADMIN_USERS_DELETE_CONFIRM, 'Confirm Delete')}</DialogTitle>
                          <DialogContent>
                            {t(UI_TRANSLATION_KEYS.ADMIN_USERS_DELETE_CONFIRM_TEXT, 'Are you sure you want to delete this user?')}
                          </DialogContent>
                          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, p: 2 }}>
                            <Button onClick={() => setConfirmDeleteId(null)}>
                              {t(UI_TRANSLATION_KEYS.USER_PROFILE_CANCEL, 'Cancel')}
                            </Button>
                            <Button
                              color="error"
                              variant="contained"
                              onClick={() => {
                                if (confirmDeleteId) onDeleteUser(confirmDeleteId);
                                setConfirmDeleteId(null);
                              }}
                            >
                              {t(UI_TRANSLATION_KEYS.ADMIN_USERS_DELETE_CONFIRM, 'Delete')}
                            </Button>
                          </Box>
                        </Dialog>
                      </Box>
                    ) : null}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <ResetUserPasswordDialog
          open={!!resetUserId}
          onClose={() => setResetUserId(null)}
          onResetPassword={newPassword => {
            if (resetUserId && newPassword) {
              onAddUser(users.find(u => u.id === resetUserId)?.username || '', newPassword);
              setResetUserId(null);
            }
          }}
        />
      </DialogContent>
    </Dialog>
  );
};

export default AdminUsersDialog;
