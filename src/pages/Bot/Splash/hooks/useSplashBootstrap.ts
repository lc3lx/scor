import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@constants/routes';
import { accountApi, ApiClientError } from '@shared/api';
import { tokenStore } from '@shared/auth/tokenStore';
import { authService } from '@features/Auth';
import { isOnboardingDone } from '@shared/onboarding/onboardingStorage';
import { bootstrapTelegramWebApp } from '@shared/telegram/telegramWebApp';

const SPLASH_MIN_MS = 1200;

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

    const finish = async (path: string) => {
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

        if (status.botAccess === 'Allowed') {
          await finish(ROUTES.home);
          return;
        }

        if (!isOnboardingDone()) {
          await finish(ROUTES.onboarding);
          return;
        }

        if (
          status.botAccess === 'BinollaNotConnected' ||
          status.botAccess === 'SessionExpired'
        ) {
          await finish(ROUTES.login);
          return;
        }

        await finish(ROUTES.settings);
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
            await finish(ROUTES.onboarding);
          } else {
            await finish(ROUTES.login);
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
