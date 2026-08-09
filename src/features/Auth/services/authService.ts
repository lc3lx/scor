import { ApiClientError, authApi } from '@shared/api';
import { tokenStore } from '@shared/auth/tokenStore';
import { getTelegramInitData } from '@shared/telegram/telegramWebApp';
import type {
  ActivationPayload,
  AuthSession,
  AuthServiceError,
  LoginCredentials,
  SignupPayload,
} from '../types';

function toAuthError(error: unknown): AuthServiceError {
  if (error instanceof ApiClientError) {
    return { message: error.message };
  }
  if (error && typeof error === 'object' && 'message' in error) {
    return { message: String((error as { message: unknown }).message) };
  }
  return { message: 'Authentication failed.' };
}

/**
 * Authenticates via Telegram Mini App initData → backend JWT.
 * Email/password/activation are obsolete and no longer authorize access.
 */
export async function loginWithTelegram(): Promise<AuthSession> {
  const initData = getTelegramInitData();
  if (!initData) {
    throw {
      message: 'Open Scar Alpha from Telegram to sign in. Telegram initData is required.',
    } satisfies AuthServiceError;
  }

  try {
    const result = await authApi.telegram(initData);
    tokenStore.setSession(result.accessToken, result.userId);
    return {
      accessToken: result.accessToken,
      userId: result.userId,
    };
  } catch (error) {
    throw toAuthError(error);
  }
}

/** @deprecated Email/password is not the product auth model. Uses Telegram auth. */
export async function login(_credentials: LoginCredentials): Promise<AuthSession> {
  return loginWithTelegram();
}

/** @deprecated Signup email flow is obsolete. Uses Telegram auth. */
export async function signup(_payload: SignupPayload): Promise<AuthSession> {
  return loginWithTelegram();
}

/** @deprecated Activation keys are obsolete. Uses Telegram auth. */
export async function activate(_payload: ActivationPayload): Promise<AuthSession> {
  return loginWithTelegram();
}

export const authService = {
  loginWithTelegram,
  login,
  signup,
  activate,
};
