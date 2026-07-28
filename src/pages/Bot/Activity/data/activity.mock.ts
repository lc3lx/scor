import { ROUTES } from '@constants/routes';
import type { NotificationItem, NotificationsPageContent } from '../types';

export const NOTIFICATIONS_PAGE_CONTENT: NotificationsPageContent = {
  title: 'Notifications',
  markAllLabel: 'Mark all',
  backAriaLabel: 'Go back',
  defaultActionLabel: 'Open Related Screen',
};

export const SEED_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-account-not-approved',
    variant: 'account-not-approved',
    title: 'Account not approved',
    description: 'Your Scar Alpha AI account was not approved.',
    timestamp: '2h ago',
    detailTimestamp: 'Today · 2h ago',
    read: false,
  },
  {
    id: 'notif-account-approved',
    variant: 'account-approved',
    title: 'Account approved',
    description:
      'Your Scar Alpha AI account has been approved. You may now activate a subscription key.',
    timestamp: '2h ago',
    detailTimestamp: 'Today · 2h ago',
    read: false,
    action: {
      label: 'Open Related Screen',
      path: ROUTES.activation,
    },
  },
  {
    id: 'notif-activation-success',
    variant: 'activation-success',
    title: 'Activation success',
    description: 'Your subscription is active until Aug 3, 2026.',
    timestamp: '2h ago',
    detailTimestamp: 'Today · 2h ago',
    read: true,
    action: {
      label: 'Open Related Screen',
      path: ROUTES.subscription,
    },
  },
  {
    id: 'notif-bot-started',
    variant: 'bot-started',
    title: 'Bot started',
    description: 'Alpha Momentum · EUR/USD · 1m',
    timestamp: '1h ago',
    detailTimestamp: 'Today · 1h ago',
    read: true,
    action: {
      label: 'Open Related Screen',
      path: ROUTES.bot,
    },
  },
  {
    id: 'notif-new-signal',
    variant: 'new-signal',
    title: 'New signal detected',
    description: 'UP signal on EUR/USD (82% strength).',
    timestamp: '38m ago',
    detailTimestamp: 'Today · 38m ago',
    read: false,
    action: {
      label: 'Open Related Screen',
      path: ROUTES.bot,
    },
  },
  {
    id: 'notif-live-trade',
    variant: 'live-trade',
    title: 'Live trade started',
    description: '$25 UP on EUR/USD · 1m expiry.',
    timestamp: '35m ago',
    detailTimestamp: 'Today · 35m ago',
    read: true,
    tradeId: 'T-2415',
  },
  {
    id: 'notif-trade-profit',
    variant: 'trade-profit',
    title: 'Trade profit',
    description: '+$22.50 on EUR/USD.',
    timestamp: '34m ago',
    detailTimestamp: 'Today · 34m ago',
    read: true,
    tradeId: 'T-2401',
  },
  {
    id: 'notif-trade-loss',
    variant: 'trade-loss',
    title: 'Trade loss',
    description: '-$10 on GBP/USD.',
    timestamp: '22m ago',
    detailTimestamp: 'Today · 22m ago',
    read: true,
    tradeId: 'T-2403',
  },
  {
    id: 'notif-profit-target',
    variant: 'profit-target',
    title: 'Profit target reached',
    description: 'Daily target +$50 reached. Bot auto-stopped.',
    timestamp: '12m ago',
    detailTimestamp: 'Today · 12m ago',
    read: true,
    action: {
      label: 'Open Related Screen',
      path: ROUTES.bot,
    },
  },
  {
    id: 'notif-loss-limit',
    variant: 'loss-limit',
    title: 'Loss limit reached',
    description: 'Daily loss limit hit. Bot auto-stopped.',
    timestamp: '10m ago',
    detailTimestamp: 'Today · 10m ago',
    read: true,
    action: {
      label: 'Open Related Screen',
      path: ROUTES.bot,
    },
  },
];

export const LIVE_TRADE_NOTIFICATION_TITLE = 'Live trade started';
