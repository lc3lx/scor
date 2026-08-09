import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@constants/routes';
import { authService } from '@features/Auth';
import { accountApi, ApiClientError, binollaApi } from '@shared/api';
import { tokenStore } from '@shared/auth/tokenStore';

export type BinollaAuthMode = 'login' | 'register';

// #region agent log
function agentLog(
  hypothesisId: string,
  location: string,
  message: string,
  data: Record<string, unknown> = {},
) {
  const payload = {
    sessionId: '660ec2',
    runId: 'pre-fix',
    hypothesisId,
    location,
    message,
    data,
    timestamp: Date.now(),
  };
  fetch('http://127.0.0.1:7892/ingest/aea6d51e-f3e9-4c7e-b6b4-db55c4306e97', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': '660ec2' },
    body: JSON.stringify(payload),
  }).catch(() => {});
  const base = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/+$/, '') ?? '';
  fetch(`${base}/api/debug/agent-log`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  }).catch(() => {});
}
// #endregion

export function useBinollaPlatformAuth(mode: BinollaAuthMode) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  const goToOtherMode = useCallback(() => {
    navigate(mode === 'login' ? ROUTES.signup : ROUTES.login);
  }, [mode, navigate]);

  const submitCredentials = useCallback(async () => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      setError('Enter your Binolla email and password.');
      setStatus('error');
      return;
    }

    setStatus('loading');
    setError(null);

    // #region agent log
    agentLog('B', 'useBinollaPlatformAuth:submit:start', 'submit started', {
      mode,
      emailLen: trimmedEmail.length,
      hasJwt: tokenStore.isAuthenticated(),
      apiBase: (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? '',
    });
    // #endregion

    try {
      if (!tokenStore.isAuthenticated()) {
        // #region agent log
        agentLog('C', 'useBinollaPlatformAuth:telegramAuth', 'calling loginWithTelegram');
        // #endregion
        await authService.loginWithTelegram();
      }

      // #region agent log
      agentLog('B', 'useBinollaPlatformAuth:beforeApi', 'calling binolla api', {
        mode,
        hasJwt: tokenStore.isAuthenticated(),
      });
      // #endregion

      const result =
        mode === 'login'
          ? await binollaApi.login({ email: trimmedEmail, password })
          : await binollaApi.signup({ email: trimmedEmail, password });

      // #region agent log
      agentLog('B', 'useBinollaPlatformAuth:apiOk', 'binolla api success', {
        mode,
        access: result.access,
        connected: result.connected,
        approvalStatus: result.approvalStatus,
      });
      // #endregion

      const accountStatus = await accountApi.status().catch(() => null);
      const botAccess = accountStatus?.botAccess ?? result.access;

      setStatus('success');
      // Clear password from memory after successful connect.
      setPassword('');
      navigate(botAccess === 'Allowed' ? ROUTES.home : ROUTES.settings, { replace: true });
    } catch (err) {
      setStatus('error');
      // #region agent log
      agentLog('B', 'useBinollaPlatformAuth:error', 'submit failed', {
        mode,
        isApiError: err instanceof ApiClientError,
        code: err instanceof ApiClientError ? err.code : undefined,
        status: err instanceof ApiClientError ? err.status : undefined,
        message: err instanceof Error ? err.message : String(err),
      });
      // #endregion
      if (err instanceof ApiClientError) {
        setError(err.message);
        return;
      }
      if (err && typeof err === 'object' && 'message' in err) {
        setError(String((err as { message: unknown }).message));
        return;
      }
      setError(
        mode === 'login'
          ? 'Binolla login failed. Check email/password and try again.'
          : 'Binolla signup failed. Check details and try again.',
      );
    }
  }, [email, mode, navigate, password]);

  const enterBotWithTelegram = useCallback(async () => {
    setStatus('loading');
    setError(null);
    try {
      if (!tokenStore.isAuthenticated()) {
        await authService.loginWithTelegram();
      }
      const accountStatus = await accountApi.status();
      setStatus('success');
      navigate(accountStatus.botAccess === 'Allowed' ? ROUTES.home : ROUTES.settings, {
        replace: true,
      });
    } catch (err) {
      setStatus('error');
      if (err instanceof ApiClientError) {
        setError(err.message);
        return;
      }
      if (err && typeof err === 'object' && 'message' in err) {
        setError(String((err as { message: unknown }).message));
        return;
      }
      setError('Open Scar Alpha from Telegram to enter the bot.');
    }
  }, [navigate]);

  return {
    mode,
    email,
    setEmail,
    password,
    setPassword,
    status,
    error,
    goToOtherMode,
    submitCredentials,
    enterBotWithTelegram,
  };
}
