import type { LoginCopy } from '../types';

/**
 * Temporary login copy — replace via CMS/API adapter when backend is ready.
 */
export const LOGIN_COPY: LoginCopy = {
  title: 'Welcome back',
  description: 'Login to access your AI trading engine',
  emailLabel: 'Email',
  emailPlaceholder: 'trader@scaralpha.ai',
  passwordLabel: 'Password',
  passwordPlaceholder: '••••••••',
  forgotPasswordLabel: 'Forgot Password?',
  submitLabel: 'Login',
  createAccountLabel: 'Create Account',
  securityTitle: 'Bank-grade encryption',
  securitySubtitle: 'Your credentials are always secure',
  footerPrefix: '© 2026 Scar Alpha AI. developed by ',
  footerLinkLabel: 'Hul',
  footerSuffix: ' Company',
  footerHref: 'https://hul.company',
};

export const LOGIN_INITIAL_VALUES = {
  email: '',
  password: '',
} as const;
