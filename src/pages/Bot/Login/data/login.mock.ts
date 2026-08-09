import type { LoginCopy } from '../types';

/**
 * Temporary login copy — replace via CMS/API adapter when backend is ready.
 */
export const LOGIN_COPY: LoginCopy = {
  title: 'Welcome back',
  description: 'Continue with Telegram Mini App authentication',
  emailLabel: 'Email (unused)',
  emailPlaceholder: 'Open from Telegram',
  passwordLabel: 'Password (unused)',
  passwordPlaceholder: '••••••••',
  forgotPasswordLabel: 'Telegram sign-in only',
  submitLabel: 'Continue with Telegram',
  createAccountLabel: 'Create Account',
  securityTitle: 'Server-side Telegram verification',
  securitySubtitle: 'JWT issued after backend validates initData',
  footerPrefix: '© 2026 Scar Alpha AI. developed by ',
  footerLinkLabel: 'Hul',
  footerSuffix: ' Company',
  footerHref: 'https://hul.company',
};

export const LOGIN_INITIAL_VALUES = {
  email: 'telegram@scaralpha.local',
  password: 'telegram-auth',
} as const;
