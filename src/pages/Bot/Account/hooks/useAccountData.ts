import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@constants/routes';
import { ApiClientError } from '@shared/api';
import { tokenStore } from '@shared/auth/tokenStore';
import { t } from '@shared/i18n';
import { accountService } from '../services/accountService';
import type { AccountSnapshot } from '../types';

export function useAccountData() {
  const navigate = useNavigate();
  const [snapshot, setSnapshot] = useState<AccountSnapshot | null>(null);
  const [error, setError] = useState<string | null>(null);
  const activeRef = useRef(true);

  useEffect(() => {
    activeRef.current = true;

    const load = async () => {
      try {
        const next = await accountService.fetchAccountSnapshot();
        if (activeRef.current) {
          setSnapshot(next);
          setError(null);
        }
      } catch (err) {
        if (err instanceof ApiClientError && err.status === 401) {
          tokenStore.clear();
          navigate(ROUTES.login, { replace: true });
          return;
        }
        if (activeRef.current) {
          setError(err instanceof ApiClientError ? err.message : t('account.loadError'));
        }
      }
    };

    void load();

    const unsubscribe = accountService.subscribe(() => {
      void load();
    });

    return () => {
      activeRef.current = false;
      unsubscribe();
    };
  }, [navigate]);

  const refresh = useCallback(async () => {
    const next = await accountService.fetchAccountSnapshot();
    if (activeRef.current) setSnapshot(next);
  }, []);

  const logout = useCallback(async () => {
    await accountService.logout();
  }, []);

  return {
    snapshot,
    isLoading: snapshot === null && !error,
    error,
    refresh,
    logout,
  };
}

export type UseAccountDataReturn = ReturnType<typeof useAccountData>;
