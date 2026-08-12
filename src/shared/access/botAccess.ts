import { ROUTES } from '@constants/routes';

/** Live market / RSI / balance — connected pending users included. */
export function canBrowseMarket(botAccess?: string | null): boolean {
  return botAccess === 'Allowed' || botAccess === 'AdminApprovalRequired';
}

/** Demo place-order — admin approval required. */
export function canTrade(botAccess?: string | null): boolean {
  return botAccess === 'Allowed';
}

/** After connect/login, pending users go to Home (browse) not Settings. */
export function routeForBotAccess(botAccess?: string | null): string {
  if (botAccess === 'Allowed' || botAccess === 'AdminApprovalRequired') {
    return ROUTES.home;
  }
  if (botAccess === 'BinollaNotConnected' || botAccess === 'SessionExpired') {
    return ROUTES.login;
  }
  return ROUTES.settings;
}

export const ADMIN_NOT_APPROVED_TRADE_MESSAGE =
  'Administrator has not approved your account yet. You can view markets and signals, but trading is locked until approval.';
