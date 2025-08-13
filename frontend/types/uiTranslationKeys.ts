// Centralized translation keys for UI components
// Add a comment for each key to help translators and developers

export const UI_TRANSLATION_KEYS = {
  /**
   * Pantry page title
   * Used in: PantryOverview.tsx
   */
  PANTRY_TITLE: 'pantry.title',
  /**
   * Pantry empty state message
   * Used in: PantryOverview.tsx
   */
  PANTRY_EMPTY: 'pantry.empty',
  /**
   * Pantry add item button
   * Used in: PantryOverview.tsx
   */
  PANTRY_ADD: 'pantry.add',
  /**
   * Aria-label for the theme toggle switch (dark/light mode)
   * Used in: ThemeToggle.tsx
   */
  THEME_TOGGLE: 'theme.toggle',
  /**
   * Bottom navigation: Shopping Lists tab
   */
  NAV_SHOPPING_LISTS: 'nav.shoppingLists',
  /**
   * Bottom navigation: CookieDoo Import tab
   */
  NAV_COOKIEDOO_IMPORT: 'nav.cookiedooImport',
  /**
   * Bottom navigation: Pantry Overview tab
   */
  NAV_PANTRY_OVERVIEW: 'nav.pantryOverview',
  /**
   * Login page labels
   */
  LOGIN_TITLE: 'login.title',
  REGISTER_TITLE: 'register.title',
  USERNAME_LABEL: 'login.username',
  PASSWORD_LABEL: 'login.password',
  LOGIN_BUTTON: 'login.button',
  REGISTER_BUTTON: 'register.button',
  TOGGLE_TO_REGISTER: 'login.toggleToRegister',
  TOGGLE_TO_LOGIN: 'register.toggleToLogin',
  SUCCESS: 'login.success',
  ERROR: 'login.error',
  /**
   * User Profile dialog labels
   */
  USER_PROFILE_TITLE: 'userProfile.title',
  USER_PROFILE_AVATAR_LABEL: 'userProfile.avatarLabel',
  USER_PROFILE_USERNAME_LABEL: 'userProfile.usernameLabel',
  USER_PROFILE_JOINED_LABEL: 'userProfile.joinedLabel',
  USER_PROFILE_EDIT_USERNAME: 'userProfile.editUsername',
  USER_PROFILE_SAVE: 'userProfile.save',
  USER_PROFILE_CANCEL: 'userProfile.cancel',
  USER_PROFILE_THEME_LABEL: 'userProfile.themeLabel',
  USER_PROFILE_CHANGE_PASSWORD: 'userProfile.changePassword',
  USER_PROFILE_LOGOUT: 'userProfile.logout',
  USER_PROFILE_DELETE_ACCOUNT: 'userProfile.deleteAccount',
  USER_PROFILE_DELETE_CONFIRM: 'userProfile.deleteConfirm',
  USER_PROFILE_DELETE_WARNING: 'userProfile.deleteWarning',
  USER_PROFILE_PASSWORD_CURRENT: 'userProfile.passwordCurrent',
  USER_PROFILE_PASSWORD_NEW: 'userProfile.passwordNew',
  USER_PROFILE_PASSWORD_CHANGE: 'userProfile.passwordChange',
  USER_PROFILE_PASSWORD_CANCEL: 'userProfile.passwordCancel',
  USER_PROFILE_ERROR: 'userProfile.error',
  /**
   * Admin user management dialog labels
   */
  ADMIN_USERS_TITLE: 'admin.users.title',
  ADMIN_USERS_ADD: 'admin.users.add',
  ADMIN_USERS_DELETE: 'admin.users.delete',
  ADMIN_USERS_ACTIONS: 'admin.users.actions',
  ADMIN_USERS_USERNAME: 'admin.users.username',
  ADMIN_USERS_PASSWORD: 'admin.users.password',
  ADMIN_USERS_CLOSE: 'admin.users.close',
  ADMIN_USERS_RESET_PASSWORD: 'admin.users.resetPassword',
  ADMIN_USERS_DELETE_CONFIRM: 'admin.users.deleteConfirm',
  ADMIN_USERS_DELETE_CONFIRM_TEXT: 'admin.users.deleteConfirmText',
} as const;

