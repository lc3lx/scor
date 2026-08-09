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
  description: 'Register on Binolla with our partner link, then continue with Telegram.',
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
  binollaLabel: 'Binolla SSID (after registering via partner link)',
  binollaPlaceholder: 'Paste Binolla session SSID',
  submitLabel: 'Continue with Telegram',
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
