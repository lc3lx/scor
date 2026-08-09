const TOKEN_KEY = 'scaralpha.jwt';
const USER_KEY = 'scaralpha.userId';

/**
 * JWT only — never store Binolla SSID here.
 */
export const tokenStore = {
  getAccessToken(): string | null {
    try {
      return sessionStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },

  getUserId(): string | null {
    try {
      return sessionStorage.getItem(USER_KEY);
    } catch {
      return null;
    }
  },

  setSession(accessToken: string, userId: string): void {
    sessionStorage.setItem(TOKEN_KEY, accessToken);
    sessionStorage.setItem(USER_KEY, userId);
  },

  clear(): void {
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
  },

  isAuthenticated(): boolean {
    return Boolean(this.getAccessToken());
  },
};
