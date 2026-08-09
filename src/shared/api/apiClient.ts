import { tokenStore } from '../auth/tokenStore';
import type { ApiErrorBody } from './types';

export class ApiClientError extends Error {
  readonly code: string;
  readonly status: number;

  constructor(code: string, message: string, status: number) {
    super(message);
    this.name = 'ApiClientError';
    this.code = code;
    this.status = status;
  }
}

function resolveBaseUrl(): string {
  const raw = import.meta.env.VITE_API_BASE_URL as string | undefined;
  // Explicit empty string → same-origin (Vite proxy in dev).
  if (raw !== undefined && raw.trim() === '') {
    return '';
  }

  const base = raw?.trim();
  if (base) {
    return base.replace(/\/+$/, '');
  }

  // Dev default: use Vite proxy (/api → backend). Production must set VITE_API_BASE_URL.
  if (import.meta.env.DEV) {
    return '';
  }

  throw new ApiClientError(
    'CONFIG_ERROR',
    'VITE_API_BASE_URL is not configured.',
    0,
  );
}

function mapMessage(code: string, fallback: string): string {
  switch (code) {
    case 'BINOLLA_NOT_CONNECTED':
      return 'Connect your Binolla account to continue.';
    case 'BINOLLA_SESSION_EXPIRED':
      return 'Your Binolla session expired. Please reconnect.';
    case 'BINOLLA_LOGIN_FAILED':
      return 'Binolla login/signup failed. Check email and password.';
    case 'BINOLLA_CONNECTION_FAILED':
      return 'Unable to connect to Binolla right now.';
    case 'ADMIN_APPROVAL_REQUIRED':
      return 'Your Binolla account is waiting for administrator approval.';
    case 'NOT_ELIGIBLE':
      return 'This account was rejected by an administrator.';
    case 'FORBIDDEN':
      return 'You do not have permission to perform this action.';
    case 'MARKET_UNAVAILABLE':
      return 'Market data is temporarily unavailable.';
    case 'INSUFFICIENT_BALANCE':
      return 'Insufficient Demo balance for this trade.';
    case 'RATE_LIMITED':
      return 'Too many trade requests. Please wait and try again.';
    case 'INVALID_TRADE':
      return 'Trade request is invalid.';
    case 'STRATEGY_DISABLED':
      return 'This strategy is not available yet.';
    case 'STRATEGY_NOT_FOUND':
      return 'Strategy was not found.';
    case 'REAL_TRADING_DISABLED':
      return 'Real trading is disabled.';
    case 'TELEGRAM_AUTH_INVALID':
      return 'Telegram authentication failed. Open the app from Telegram.';
    case 'UNAUTHORIZED':
      return 'Your session expired. Please sign in again.';
    default:
      return fallback || 'Something went wrong. Please try again.';
  }
}

type RequestOptions = {
  method?: string;
  body?: unknown;
  auth?: boolean;
  headers?: Record<string, string>;
  signal?: AbortSignal;
};

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const baseUrl = resolveBaseUrl();
  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...options.headers,
  };

  if (options.body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }

  const auth = options.auth !== false;
  if (auth) {
    const token = tokenStore.getAccessToken();
    if (!token) {
      throw new ApiClientError('UNAUTHORIZED', mapMessage('UNAUTHORIZED', 'Not authenticated.'), 401);
    }
    headers.Authorization = `Bearer ${token}`;
  }

  let response: Response;
  try {
    response = await fetch(`${baseUrl}${path}`, {
      method: options.method ?? (options.body !== undefined ? 'POST' : 'GET'),
      headers,
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
      signal: options.signal,
    });
  } catch {
    throw new ApiClientError('NETWORK_ERROR', 'Network error. Check your connection.', 0);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const text = await response.text();
  let payload: unknown = null;
  if (text) {
    try {
      payload = JSON.parse(text) as unknown;
    } catch {
      payload = null;
    }
  }

  if (!response.ok) {
    const err = (payload ?? {}) as Partial<ApiErrorBody>;
    const code = err.code ?? (response.status === 401 ? 'UNAUTHORIZED' : 'REQUEST_FAILED');
    const message = mapMessage(code, err.message ?? `Request failed (${response.status})`);

    // Only clear Telegram JWT when the Scar Alpha session itself is invalid —
    // never on Binolla credential / session errors (same HTTP 401 status).
    if (
      response.status === 401 &&
      (code === 'UNAUTHORIZED' || code === 'TELEGRAM_AUTH_INVALID')
    ) {
      tokenStore.clear();
    }

    throw new ApiClientError(code, message, response.status);
  }

  return payload as T;
}

export function createIdempotencyKey(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `idem-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}
