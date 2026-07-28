import {
  LIVE_TRADE_NOTIFICATION_TITLE,
  NOTIFICATIONS_PAGE_CONTENT,
  SEED_NOTIFICATIONS,
} from './activity.mock';
import { accountService } from '../../Account/services/accountService';
import type { NotificationItem } from '../types';

type NotificationListener = () => void;

let notifications: NotificationItem[] = SEED_NOTIFICATIONS.map((item) => ({ ...item }));
const listeners = new Set<NotificationListener>();

function cloneNotifications(): NotificationItem[] {
  return notifications.map((item) => ({ ...item }));
}

function unreadCount(): number {
  return notifications.filter((item) => !item.read).length;
}

function syncAccountBadge(): void {
  accountService.setUnreadNotificationCount(unreadCount());
}

function notifyListeners(): void {
  listeners.forEach((listener) => listener());
}

export const activityService = {
  subscribe(listener: NotificationListener): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  async fetchNotifications(): Promise<NotificationItem[]> {
    return cloneNotifications();
  },

  async getNotificationById(id: string): Promise<NotificationItem | null> {
    const match = notifications.find((item) => item.id === id);
    return match ? { ...match } : null;
  },

  async markRead(id: string): Promise<NotificationItem | null> {
    let updated: NotificationItem | null = null;
    notifications = notifications.map((item) => {
      if (item.id !== id) return item;
      updated = { ...item, read: true };
      return updated;
    });
    syncAccountBadge();
    notifyListeners();
    return updated;
  },

  async markAllRead(): Promise<NotificationItem[]> {
    notifications = notifications.map((item) => ({ ...item, read: true }));
    syncAccountBadge();
    notifyListeners();
    return cloneNotifications();
  },

  async addTradeNotification(input: {
    tradeId: string;
    description: string;
    variant?: NotificationItem['variant'];
    title?: string;
  }): Promise<NotificationItem> {
    const notification: NotificationItem = {
      id: `notif-${input.tradeId}-${Date.now()}`,
      variant: input.variant ?? 'live-trade',
      title: input.title ?? LIVE_TRADE_NOTIFICATION_TITLE,
      description: input.description,
      timestamp: 'Just now',
      detailTimestamp: 'Today · Just now',
      read: false,
      tradeId: input.tradeId,
    };

    notifications = [notification, ...notifications];
    syncAccountBadge();
    notifyListeners();
    return notification;
  },

  getNotificationsPageContent() {
    return NOTIFICATIONS_PAGE_CONTENT;
  },

  reset(): void {
    notifications = SEED_NOTIFICATIONS.map((item) => ({ ...item }));
    syncAccountBadge();
    notifyListeners();
  },
};

export type ActivityService = typeof activityService;
