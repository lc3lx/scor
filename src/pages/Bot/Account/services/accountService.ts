import {
  ACTIVATION_HISTORY_PAGE_CONTENT,
  CHANGE_PASSWORD_COPY,
  EDIT_PROFILE_COPY,
  SEED_ACCOUNT_SNAPSHOT,
  SUBSCRIPTION_PAGE_CONTENT,
} from '../data/account.mock';
import type {
  AccountSnapshot,
  ChangePasswordFormValues,
  EditProfileFormValues,
} from '../types';

type AccountListener = () => void;

let snapshot: AccountSnapshot = structuredClone(SEED_ACCOUNT_SNAPSHOT);
const listeners = new Set<AccountListener>();

const MOCK_PASSWORD = 'password123';
const NETWORK_DELAY_MS = 450;

function cloneSnapshot(): AccountSnapshot {
  return structuredClone(snapshot);
}

function notifyListeners(): void {
  listeners.forEach((listener) => listener());
}

function delay(): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, NETWORK_DELAY_MS);
  });
}

export const accountService = {
  subscribe(listener: AccountListener): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  async fetchAccountSnapshot(): Promise<AccountSnapshot> {
    await delay();
    return cloneSnapshot();
  },

  async updateProfile(values: EditProfileFormValues): Promise<AccountSnapshot> {
    await delay();

    snapshot = {
      ...snapshot,
      profile: {
        ...snapshot.profile,
        fullName: values.fullName.trim(),
        country: values.country.trim(),
        telegramId: values.telegramId.trim(),
      },
      details: snapshot.details.map((item) => {
        if (item.id === 'country') return { ...item, value: values.country.trim() };
        if (item.id === 'telegram') return { ...item, value: values.telegramId.trim() };
        return item;
      }),
    };

    notifyListeners();
    return cloneSnapshot();
  },

  async changePassword(values: ChangePasswordFormValues): Promise<void> {
    await delay();

    if (values.currentPassword !== MOCK_PASSWORD) {
      throw { message: 'Current password is incorrect.' };
    }

    if (values.newPassword === values.currentPassword) {
      throw { message: 'New password must be different from the current password.' };
    }
  },

  async logout(): Promise<void> {
    await delay();
  },

  getEditProfileCopy() {
    return EDIT_PROFILE_COPY;
  },

  getEditProfileInitialValues(): EditProfileFormValues {
    return {
      fullName: snapshot.profile.fullName,
      country: snapshot.profile.country,
      telegramId: snapshot.profile.telegramId,
      binollaAccountId: snapshot.profile.binollaAccountId,
    };
  },

  getChangePasswordCopy() {
    return CHANGE_PASSWORD_COPY;
  },

  getSubscriptionPageContent() {
    return SUBSCRIPTION_PAGE_CONTENT;
  },

  getActivationHistoryPageContent() {
    return ACTIVATION_HISTORY_PAGE_CONTENT;
  },

  async getSubscriptionDetails() {
    await delay();
    return { ...snapshot.subscription };
  },

  async getActivationHistory() {
    await delay();
    return snapshot.activationHistory.map((entry) => ({ ...entry }));
  },

  setUnreadNotificationCount(count: number): void {
    snapshot = {
      ...snapshot,
      menuItems: snapshot.menuItems.map((item) =>
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
    snapshot = structuredClone(SEED_ACCOUNT_SNAPSHOT);
    notifyListeners();
  },
};

export type AccountService = typeof accountService;
