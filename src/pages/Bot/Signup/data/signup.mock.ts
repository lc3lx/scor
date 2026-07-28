import type { SignupFormValues } from '@features/Auth';

export type SignupCopy = {
  title: string;
  description: string;
  fullNameLabel: string;
  fullNamePlaceholder: string;
  emailLabel: string;
  emailPlaceholder: string;
  passwordLabel: string;
  passwordPlaceholder: string;
  countryLabel: string;
  countryPlaceholder: string;
  telegramLabel: string;
  telegramPlaceholder: string;
  binollaLabel: string;
  binollaPlaceholder: string;
  submitLabel: string;
  dividerLabel: string;
  promptLabel: string;
  signInLabel: string;
};

/**
 * Temporary signup copy — replace via CMS/API adapter when backend is ready.
 */
export const SIGNUP_COPY: SignupCopy = {
  title: 'Join Scar Alpha AI',
  description: 'Complete your profile for account review.',
  fullNameLabel: 'Full Name',
  fullNamePlaceholder: 'John Trader',
  emailLabel: 'Email',
  emailPlaceholder: 'you@email.com',
  passwordLabel: 'Password',
  passwordPlaceholder: '••••••••',
  countryLabel: 'Country',
  countryPlaceholder: 'United States',
  telegramLabel: 'Telegram ID',
  telegramPlaceholder: '@yourhandle',
  binollaLabel: 'Binolla Account ID / Email',
  binollaPlaceholder: 'ID or email',
  submitLabel: 'Create Account',
  dividerLabel: 'or',
  promptLabel: 'Already have an account?',
  signInLabel: 'Sign in',
};

export const SIGNUP_INITIAL_VALUES: SignupFormValues = {
  fullName: '',
  email: '',
  password: '',
  country: '',
  telegramId: '',
  binollaAccount: '',
};
