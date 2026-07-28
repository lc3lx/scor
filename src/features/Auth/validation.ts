import type {
  ActivationFormValues,
  FieldErrors,
  LoginFormValues,
  SignupFormValues,
} from './types';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const TELEGRAM_PATTERN = /^@?[a-zA-Z0-9_]{5,32}$/;
const MIN_PASSWORD_LENGTH = 8;

export function required(value: string, label: string): string | undefined {
  if (!value.trim()) {
    return `${label} is required.`;
  }

  return undefined;
}

export function emailRule(value: string): string | undefined {
  const missing = required(value, 'Email');
  if (missing) {
    return missing;
  }

  if (!EMAIL_PATTERN.test(value.trim())) {
    return 'Enter a valid email address.';
  }

  return undefined;
}

export function passwordRule(value: string): string | undefined {
  const missing = required(value, 'Password');
  if (missing) {
    return missing;
  }

  if (value.length < MIN_PASSWORD_LENGTH) {
    return `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`;
  }

  return undefined;
}

export function telegramRule(value: string): string | undefined {
  const missing = required(value, 'Telegram ID');
  if (missing) {
    return missing;
  }

  if (!TELEGRAM_PATTERN.test(value.trim())) {
    return 'Enter a valid Telegram ID.';
  }

  return undefined;
}

export function validateLoginForm(values: LoginFormValues): FieldErrors<keyof LoginFormValues> {
  return {
    email: emailRule(values.email),
    password: passwordRule(values.password),
  };
}

export function validateSignupForm(values: SignupFormValues): FieldErrors<keyof SignupFormValues> {
  return {
    fullName: required(values.fullName, 'Full Name'),
    email: emailRule(values.email),
    password: passwordRule(values.password),
    country: required(values.country, 'Country'),
    telegramId: telegramRule(values.telegramId),
    binollaAccount: required(values.binollaAccount, 'Binolla Account ID / Email'),
  };
}

export function validateActivationForm(
  values: ActivationFormValues,
): FieldErrors<keyof ActivationFormValues> {
  return {
    activationKey: required(values.activationKey, 'Activation Key'),
  };
}

export function hasFieldErrors<T extends string>(errors: FieldErrors<T>): boolean {
  return Object.values(errors).some((message) => Boolean(message));
}
