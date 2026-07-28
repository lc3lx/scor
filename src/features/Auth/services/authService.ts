import type {
  ActivationPayload,
  AuthSession,
  AuthServiceError,
  LoginCredentials,
  SignupPayload,
} from '../types';

const DEMO_INVALID_KEY = 'invalid';

function delay(ms = 400): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

/**
 * Authentication adapter — replace mock bodies with real HTTP calls later.
 * UI depends only on this typed contract.
 */
export async function login(credentials: LoginCredentials): Promise<AuthSession> {
  await delay();

  if (!credentials.email || !credentials.password) {
    const error: AuthServiceError = { message: 'Email and password are required.' };
    throw error;
  }

  return {
    accessToken: 'mock-access-token',
    userId: 'mock-user-id',
  };
}

export async function signup(payload: SignupPayload): Promise<AuthSession> {
  await delay();

  if (!payload.email || !payload.password || !payload.fullName) {
    const error: AuthServiceError = { message: 'Please complete all required fields.' };
    throw error;
  }

  return {
    accessToken: 'mock-access-token',
    userId: 'mock-user-id',
  };
}

export async function activate(payload: ActivationPayload): Promise<AuthSession> {
  await delay();

  const key = payload.activationKey.trim();

  if (!key) {
    const error: AuthServiceError = { message: 'Activation key is required.' };
    throw error;
  }

  if (key.toLowerCase() === DEMO_INVALID_KEY) {
    const error: AuthServiceError = {
      message: 'Invalid activation key. Please check and try again.',
    };
    throw error;
  }

  return {
    accessToken: 'mock-access-token',
    userId: 'mock-user-id',
  };
}

export const authService = {
  login,
  signup,
  activate,
};
