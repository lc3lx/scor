type TelegramOpenLinkOptions = {
  try_instant_view?: boolean;
};

type TelegramWebAppLike = {
  initData?: string;
  ready?: () => void;
  expand?: () => void;
  openLink?: (url: string, options?: TelegramOpenLinkOptions) => void;
};

declare global {
  interface Window {
    Telegram?: {
      WebApp?: TelegramWebAppLike;
    };
  }
}

/**
 * Reads Telegram Mini App initData for backend validation.
 * Never use initDataUnsafe for authorization.
 */
export function getTelegramInitData(): string {
  const fromWebApp = window.Telegram?.WebApp?.initData?.trim() ?? '';
  if (fromWebApp) return fromWebApp;

  // Local/dev override only — never used as production auth source of truth.
  const fromEnv = (import.meta.env.VITE_DEV_TELEGRAM_INIT_DATA as string | undefined)?.trim() ?? '';
  return fromEnv;
}

export function bootstrapTelegramWebApp(): void {
  try {
    window.Telegram?.WebApp?.ready?.();
    window.Telegram?.WebApp?.expand?.();
  } catch {
    // Outside Telegram — ignore.
  }
}

/**
 * Opens an HTTPS URL in Telegram's in-app browser (WebView).
 * Falls back to a new tab outside Telegram.
 */
export function openExternalLink(url: string): void {
  const webApp = window.Telegram?.WebApp;
  try {
    if (webApp?.openLink) {
      webApp.openLink(url, { try_instant_view: false });
      return;
    }
  } catch {
    // Fall through to window.open.
  }

  window.open(url, '_blank', 'noopener,noreferrer');
}
