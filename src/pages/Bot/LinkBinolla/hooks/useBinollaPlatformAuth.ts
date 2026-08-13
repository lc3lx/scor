import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@constants/routes';
import { authService } from '@features/Auth';
import { accountApi, ApiClientError, binollaApi } from '@shared/api';
import { routeForBotAccess } from '@shared/access/botAccess';
import { tokenStore } from '@shared/auth/tokenStore';
import { t } from '@shared/i18n';

export type BinollaAuthMode = 'login' | 'register';

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
      setError(t('binolla.auth.enterCredentials'));
      setStatus('error');
      return;
    }

    setStatus('loading');
    setError(null);

    try {
      if (!tokenStore.isAuthenticated()) {
        await authService.loginWithTelegram();
      }

      const result =
        mode === 'login'
          ? await binollaApi.login({ email: trimmedEmail, password })
          : await binollaApi.signup({ email: trimmedEmail, password });

      // Navigate from the connect response — waiting on /api/account/status races a cookie-less
      // restore and can hang ~20s then send the user back to login.
      setStatus('success');
      setPassword('');
      navigate(routeForBotAccess(result.access), { replace: true });
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
      setError(mode === 'login' ? t('binolla.auth.loginFailed') : t('binolla.auth.signupFailed'));
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
      navigate(routeForBotAccess(accountStatus.botAccess), {
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
      setError(t('binolla.auth.openFromTelegram'));
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
