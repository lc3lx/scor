import { accountAssets } from '@assets/index';
import { ROUTES } from '@constants/routes';
import type {
  AccountSnapshot,
  ActivationHistoryPageContent,
  ChangePasswordCopy,
  EditProfileCopy,
  EditProfileFormValues,
  SubscriptionPageContent,
} from '../types';

export const ACCOUNT_PAGE_CONTENT = {
  title: 'Account',
  versionLabel: 'Scar Alpha AI v2.4.1 Developed by Hul Company',
  logoutLabel: 'Logout',
};

export const EDIT_PROFILE_COPY: EditProfileCopy = {
  pageTitle: 'Edit Profile',
  fullNameLabel: 'Full Name',
  fullNamePlaceholder: 'John Trader',
  countryLabel: 'Country',
  countryPlaceholder: 'United States',
  telegramLabel: 'Telegram ID',
  telegramPlaceholder: '@yourhandle',
  binollaLabel: 'Binolla Account ID',
  binollaPlaceholder: 'ID or email',
  submitLabel: 'Save Changes',
  successMessage: 'Profile updated successfully.',
};

export const CHANGE_PASSWORD_COPY: ChangePasswordCopy = {
  pageTitle: 'Change Password',
  currentPasswordLabel: 'Current Password',
  currentPasswordPlaceholder: '••••••••',
  newPasswordLabel: 'New Password',
  newPasswordPlaceholder: '••••••••',
  confirmPasswordLabel: 'Confirm New Password',
  confirmPasswordPlaceholder: '••••••••',
  submitLabel: 'Update Password',
  successMessage: 'Password updated successfully.',
};

export const SUBSCRIPTION_PAGE_CONTENT: SubscriptionPageContent = {
  pageTitle: 'Subscription',
  enterKeyLabel: 'Enter New Activation Key',
  viewHistoryLabel: 'View Activation History',
};

export const ACTIVATION_HISTORY_PAGE_CONTENT: ActivationHistoryPageContent = {
  pageTitle: 'Activation History',
};

export const EDIT_PROFILE_INITIAL_VALUES: EditProfileFormValues = {
  fullName: 'Alex Morgan',
  country: 'United States',
  telegramId: '@alexmorgan',
  binollaAccountId: 'BNL-482910',
};

export const SEED_ACCOUNT_SNAPSHOT: AccountSnapshot = {
  profile: {
    fullName: 'Alex Morgan',
    email: 'alex.morgan@scaralpha.ai',
    country: 'United States',
    telegramId: '@alexmorgan',
    binollaAccountId: 'BNL-482910',
    accountType: 'Demo',
    expirationLabel: 'Aug 3, 2026',
    accountStatus: 'approved',
    planLabel: 'Alpha Pro',
    avatarIconSrc: accountAssets.profileUser,
  },
  badges: [
    { id: 'approved', label: 'Approved', tone: 'success' },
    { id: 'plan', label: 'Alpha Pro', tone: 'danger' },
  ],
  details: [
    {
      id: 'country',
      label: 'Country',
      value: 'United States',
      iconSrc: accountAssets.country,
    },
    {
      id: 'telegram',
      label: 'Telegram',
      value: '@alexmorgan',
      iconSrc: accountAssets.telegram,
    },
    {
      id: 'binolla-id',
      label: 'Binolla ID',
      value: 'BNL-482910',
      iconSrc: accountAssets.binollaId,
    },
    {
      id: 'account-type',
      label: 'Account Type',
      value: 'Demo',
      iconSrc: accountAssets.accountType,
    },
    {
      id: 'expiration',
      label: 'Expiration',
      value: 'Aug 3, 2026',
      iconSrc: accountAssets.expiration,
    },
  ],
  menuItems: [
    {
      id: 'edit-profile',
      label: 'Edit Profile',
      iconSrc: accountAssets.editProfile,
      route: ROUTES.editProfile,
    },
    {
      id: 'change-password',
      label: 'Change Password',
      iconSrc: accountAssets.changePassword,
      route: ROUTES.changePassword,
    },
    {
      id: 'subscription',
      label: 'Subscription',
      iconSrc: accountAssets.expiration,
      route: ROUTES.subscription,
      badge: { label: 'Active', tone: 'success' },
    },
    {
      id: 'activation-history',
      label: 'Activation History',
      iconSrc: accountAssets.activationHistory,
      route: ROUTES.activationHistory,
    },
    {
      id: 'education-guide',
      label: 'Education Guide',
      iconSrc: accountAssets.education,
      action: 'education',
      badge: { label: 'New', tone: 'danger' },
    },
    {
      id: 'notifications',
      label: 'Notifications',
      iconSrc: accountAssets.notifications,
      route: ROUTES.notifications,
      badge: { label: '3', tone: 'danger' },
    },
  ],
  pageContent: ACCOUNT_PAGE_CONTENT,
  subscription: {
    planName: 'Alpha Pro',
    status: 'active',
    statusLabel: 'Active',
    statusTone: 'success',
    startDate: 'Jul 3, 2026',
    endDate: 'Aug 3, 2026',
    daysLeft: 30,
    keyUsedLabel: 'SCAR-••••-1B2A',
    iconSrc: accountAssets.subscriptionCrown,
  },
  activationHistory: [
    {
      id: 'key-1',
      keyLabel: 'SCAR-••••-1B2A',
      status: 'active',
      statusLabel: 'Active',
      statusTone: 'success',
      planLabel: 'Plan',
      planDuration: '30 days',
      usedLabel: 'Used',
      usedDate: 'Jul 3, 2026',
      expirationLabel: 'Expires',
      expirationDate: 'Aug 3, 2026',
      iconSrc: accountAssets.historyKey,
    },
    {
      id: 'key-2',
      keyLabel: 'SCAR-••••-9F3C',
      status: 'expired',
      statusLabel: 'Expired',
      statusTone: 'neutral',
      planLabel: 'Plan',
      planDuration: '30 days',
      usedLabel: 'Used',
      usedDate: 'May 1, 2026',
      expirationLabel: 'Expires',
      expirationDate: 'May 31, 2026',
      iconSrc: accountAssets.historyKey,
    },
    {
      id: 'key-3',
      keyLabel: 'SCAR-••••-7D2E',
      status: 'expired',
      statusLabel: 'Expired',
      statusTone: 'neutral',
      planLabel: 'Plan',
      planDuration: '7 days',
      usedLabel: 'Used',
      usedDate: 'Apr 10, 2026',
      expirationLabel: 'Expires',
      expirationDate: 'Apr 17, 2026',
      iconSrc: accountAssets.historyKey,
    },
    {
      id: 'key-4',
      keyLabel: 'SCAR-••••-4A1B',
      status: 'expired',
      statusLabel: 'Expired',
      statusTone: 'neutral',
      planLabel: 'Plan',
      planDuration: '30 days',
      usedLabel: 'Used',
      usedDate: 'Mar 2, 2026',
      expirationLabel: 'Expires',
      expirationDate: 'Apr 1, 2026',
      iconSrc: accountAssets.historyKey,
    },
  ],
};
