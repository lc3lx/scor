import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@constants/routes';
import { accountApi, ApiClientError } from '@shared/api';
import { tokenStore } from '@shared/auth/tokenStore';
import { authService } from '@features/Auth';
import { isOnboardingDone } from '@shared/onboarding/onboardingStorage';
import { bootstrapTelegramWebApp } from '@shared/telegram/telegramWebApp';

const SPLASH_MIN_MS = 1200;

// #region agent log
function agentLog(
  hypothesisId: string,
  location: string,
  message: string,
  data: Record<string, unknown> = {},
) {
  const payload = {
    sessionId: '660ec2',
    runId: 'post-fix',
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

/**
 * Bootstrap: Telegram initData → JWT → account status → route.
 *
 * First launch (onboarding not done) → Onboarding
 * Allowed → Home
 * BinollaNotConnected / SessionExpired → Binolla login (reconnect)
 * AdminApprovalRequired / NotEligible / other → Account settings
 */
export function useSplashBootstrap() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    bootstrapTelegramWebApp();

    const started = Date.now();

    const finish = async (path: string, reason: string) => {
      // #region agent log
      agentLog('O', 'useSplashBootstrap:finish', 'navigating from splash', {
        path,
        reason,
        onboardingDone: isOnboardingDone(),
        hasJwt: tokenStore.isAuthenticated(),
      });
      // #endregion
      const wait = Math.max(0, SPLASH_MIN_MS - (Date.now() - started));
      await new Promise((r) => window.setTimeout(r, wait));
      if (active) navigate(path, { replace: true });
    };

    void (async () => {
      try {
        if (!tokenStore.isAuthenticated()) {
          await authService.loginWithTelegram();
        }

        const status = await accountApi.status();

        // #region agent log
        agentLog('O', 'useSplashBootstrap:status', 'account status received', {
          botAccess: status.botAccess,
          onboardingDone: isOnboardingDone(),
        });
        // #endregion

        if (status.botAccess === 'Allowed') {
          await finish(ROUTES.home, 'allowed');
          return;
        }

        if (!isOnboardingDone()) {
          await finish(ROUTES.onboarding, 'first-launch-onboarding');
          return;
        }

        if (
          status.botAccess === 'BinollaNotConnected' ||
          status.botAccess === 'SessionExpired'
        ) {
          await finish(ROUTES.login, 'binolla-reconnect');
          return;
        }

        await finish(ROUTES.settings, 'pending-or-other');
      } catch (err) {
        tokenStore.clear();
        const message =
          err instanceof ApiClientError
            ? err.message
            : err && typeof err === 'object' && 'message' in err
              ? String((err as { message: unknown }).message)
              : 'Unable to sign in with Telegram.';
        if (active) {
          setError(message);
          if (!isOnboardingDone()) {
            await finish(ROUTES.onboarding, 'auth-error-first-launch');
          } else {
            await finish(ROUTES.login, 'auth-error');
          }
        }
      }
    })();

    return () => {
      active = false;
    };
  }, [navigate]);

  return { error };
}
