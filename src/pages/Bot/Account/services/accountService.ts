import { BINOLLA_REFERRAL_LABEL } from '@constants/binolla';
import { accountAssets } from '@assets/index';
import { ROUTES } from '@constants/routes';
import {
  ACCOUNT_PAGE_CONTENT,
  ACTIVATION_HISTORY_PAGE_CONTENT,
  CHANGE_PASSWORD_COPY,
  EDIT_PROFILE_COPY,
  SEED_ACCOUNT_SNAPSHOT,
  SUBSCRIPTION_PAGE_CONTENT,
} from '../data/account.mock';
import type {
  AccountSnapshot,
  AccountMenuItem,
  ChangePasswordFormValues,
  EditProfileFormValues,
} from '../types';
import { accountApi, ApiClientError, binollaApi, meApi } from '@shared/api';
import { tokenStore } from '@shared/auth/tokenStore';

type AccountListener = () => void;

const listeners = new Set<AccountListener>();
let cachedSnapshot: AccountSnapshot | null = null;
let lastSsidHint = '';

function notifyListeners(): void {
  listeners.forEach((listener) => listener());
}

function formatBotAccessLabel(botAccess: string): string {
  switch (botAccess) {
    case 'Allowed':
      return 'Allowed';
    case 'BinollaNotConnected':
      return 'Binolla not connected';
    case 'AdminApprovalRequired':
      return 'Waiting for admin approval';
    case 'NotEligible':
      return 'Rejected';
    case 'SessionExpired':
      return 'Session expired';
    default:
      return botAccess;
  }
}

function buildSnapshotFromApi(): Promise<AccountSnapshot> {
  return (async () => {
    const [me, status] = await Promise.all([meApi.get(), accountApi.status()]);

    const fullName = me.fullName?.trim() || me.username?.trim() || 'Trader';
    const telegram = me.username ? `@${me.username.replace(/^@/, '')}` : String(me.telegramUserId);
    const accessLabel = formatBotAccessLabel(status.botAccess);
    const approvalLabel = status.approvalStatus;

    const badges = [
      {
        id: 'access',
        label: accessLabel,
        tone:
          status.botAccess === 'Allowed'
            ? ('success' as const)
            : status.botAccess === 'AdminApprovalRequired'
              ? ('warning' as const)
              : ('danger' as const),
      },
      {
        id: 'approval',
        label: `Approval: ${approvalLabel}`,
        tone: status.adminApproved ? ('success' as const) : ('warning' as const),
      },
    ];

    const menuItems: AccountMenuItem[] = [
      {
        id: 'edit-profile',
        label: 'Edit Profile / Link Binolla',
        iconSrc: accountAssets.editProfile,
        route: ROUTES.editProfile,
      },
      {
        id: 'notifications',
        label: 'Notifications',
        iconSrc: accountAssets.notifications,
        route: ROUTES.notifications,
      },
    ];

    if (me.isAdmin) {
      menuItems.unshift({
        id: 'admin',
        label: 'Admin Approvals',
        iconSrc: accountAssets.subscriptionCrown,
        route: ROUTES.admin,
      });
    }

    const snapshot: AccountSnapshot = {
      profile: {
        fullName,
        email: '',
        country: me.country ?? '—',
        telegramId: telegram,
        binollaAccountId: status.binollaConnected ? 'Connected' : 'Not connected',
        accountType: status.accountType || 'Demo',
        expirationLabel: 'None',
        accountStatus:
          status.botAccess === 'Allowed'
            ? 'approved'
            : status.botAccess === 'NotEligible'
              ? 'rejected'
              : status.botAccess === 'SessionExpired'
                ? 'pending'
                : 'pending',
        planLabel: 'Free (admin approved)',
        avatarIconSrc: accountAssets.profileUser,
      },
      badges,
      details: [
        {
          id: 'telegram',
          label: 'Telegram',
          value: telegram,
          iconSrc: accountAssets.telegram,
        },
        {
          id: 'binolla',
          label: 'Binolla',
          value:
            status.botAccess === 'SessionExpired'
              ? 'Session expired — reconnect'
              : status.binollaConnected
                ? 'Connected'
                : 'Not connected',
          iconSrc: accountAssets.binollaId,
        },
        {
          id: 'account-type',
          label: 'Account Type',
          value: status.accountType || 'Demo',
          iconSrc: accountAssets.accountType,
        },
        {
          id: 'approval',
          label: 'Approval Status',
          value: approvalLabel,
          iconSrc: accountAssets.expiration,
        },
        {
          id: 'bot-access',
          label: 'Bot Access',
          value: accessLabel,
          iconSrc: accountAssets.accountType,
        },
      ],
      menuItems,
      pageContent: {
        ...ACCOUNT_PAGE_CONTENT,
        versionLabel:
          status.botAccess === 'SessionExpired'
            ? 'Binolla session expired · Reconnect your SSID in Edit Profile'
            : status.botAccess === 'AdminApprovalRequired'
              ? 'Binolla connected · Waiting for administrator approval · Free after approval'
              : 'Scar Alpha · Free access after admin approval',
      },
      subscription: {
        ...SEED_ACCOUNT_SNAPSHOT.subscription,
        planName: 'Free (admin approved)',
        status: status.botAccess === 'Allowed' ? 'active' : 'pending',
        statusLabel: accessLabel,
        statusTone: status.botAccess === 'Allowed' ? 'success' : 'warning',
        startDate: '—',
        endDate: 'None',
        daysLeft: 0,
        keyUsedLabel: `Approval: ${approvalLabel}`,
      },
      activationHistory: [],
      botAccess: status.botAccess,
    };

    cachedSnapshot = snapshot;
    return structuredClone(snapshot);
  })();
}

export const accountService = {
  subscribe(listener: AccountListener): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  async fetchAccountSnapshot(): Promise<AccountSnapshot> {
    try {
      return await buildSnapshotFromApi();
    } catch (error) {
      if (error instanceof ApiClientError && error.status === 401) {
        tokenStore.clear();
      }
      throw error;
    }
  },

  async updateProfile(values: EditProfileFormValues): Promise<AccountSnapshot> {
    const ssid = values.binollaAccountId.trim();
    if (ssid && ssid !== 'Connected' && ssid !== 'Not connected' && ssid !== lastSsidHint) {
      await binollaApi.connect({ ssid, accountType: 'Demo' });
      lastSsidHint = 'Connected';
    }

    const snapshot = await buildSnapshotFromApi();
    notifyListeners();
    return snapshot;
  },

  async changePassword(_values: ChangePasswordFormValues): Promise<void> {
    throw { message: 'Password login is not used. Authenticate via Telegram Mini App.' };
  },

  async logout(): Promise<void> {
    try {
      await binollaApi.disconnect().catch(() => undefined);
    } finally {
      tokenStore.clear();
      cachedSnapshot = null;
      notifyListeners();
    }
  },

  getEditProfileCopy() {
    return {
      ...EDIT_PROFILE_COPY,
      binollaLabel: 'Binolla SSID (fallback)',
      binollaPlaceholder: 'Optional — paste SSID only if credential login is unavailable',
      binollaHelpText:
        'Preferred: use Sign up / Log in with Binolla email. SSID paste is a fallback. New accounts should use partner signup (lid=15968).',
      binollaRegisterLabel: BINOLLA_REFERRAL_LABEL,
      binollaRegisterHref: '/signup',
      successMessage: 'Saved. If Binolla was linked, wait for administrator approval.',
    };
  },

  getEditProfileInitialValues(): EditProfileFormValues {
    return {
      fullName: cachedSnapshot?.profile.fullName ?? '',
      country: cachedSnapshot?.profile.country ?? '',
      telegramId: cachedSnapshot?.profile.telegramId ?? '',
      binollaAccountId: '',
    };
  },

  getChangePasswordCopy() {
    return CHANGE_PASSWORD_COPY;
  },

  getSubscriptionPageContent() {
    return {
      ...SUBSCRIPTION_PAGE_CONTENT,
      pageTitle: 'Access',
      enterKeyLabel: 'Link Binolla account',
      viewHistoryLabel: 'Back to account',
    };
  },

  getActivationHistoryPageContent() {
    return ACTIVATION_HISTORY_PAGE_CONTENT;
  },

  async getSubscriptionDetails() {
    const status = await accountApi.status();
    return {
      planName: 'Free (admin approved)',
      status: status.botAccess === 'Allowed' ? ('active' as const) : ('pending' as const),
      statusLabel: formatBotAccessLabel(status.botAccess),
      statusTone: status.botAccess === 'Allowed' ? ('success' as const) : ('warning' as const),
      startDate: '—',
      endDate: 'None',
      daysLeft: 0,
      keyUsedLabel: `Approval: ${status.approvalStatus}`,
      iconSrc: accountAssets.subscriptionCrown,
    };
  },

  async getActivationHistory() {
    return [];
  },

  setUnreadNotificationCount(count: number): void {
    if (!cachedSnapshot) return;
    cachedSnapshot = {
      ...cachedSnapshot,
      menuItems: cachedSnapshot.menuItems.map((item) =>
        item.id === 'notifications'
          ? {
              ...item,
              badge: count > 0 ? { label: String(count), tone: 'danger' as const } : undefined,
            }
          : item,
      ),
    };
    notifyListeners();
  },

  reset(): void {
    cachedSnapshot = null;
    notifyListeners();
  },
};

export type AccountService = typeof accountService;
