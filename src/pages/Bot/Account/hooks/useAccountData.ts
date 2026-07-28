import { useCallback, useEffect, useRef, useState } from 'react';
import { accountService } from '../services/accountService';
import type { AccountSnapshot } from '../types';

export function useAccountData() {
  const [snapshot, setSnapshot] = useState<AccountSnapshot | null>(null);
  const activeRef = useRef(true);

  useEffect(() => {
    activeRef.current = true;

    const load = async () => {
      const next = await accountService.fetchAccountSnapshot();
      if (activeRef.current) setSnapshot(next);
    };

    void load();

    const unsubscribe = accountService.subscribe(() => {
      void load();
    });

    return () => {
      activeRef.current = false;
      unsubscribe();
    };
  }, []);

  const refresh = useCallback(async () => {
    const next = await accountService.fetchAccountSnapshot();
    if (activeRef.current) setSnapshot(next);
  }, []);

  const logout = useCallback(async () => {
    await accountService.logout();
  }, []);

  return {
    snapshot,
    isLoading: snapshot === null,
    refresh,
    logout,
  };
}

export type UseAccountDataReturn = ReturnType<typeof useAccountData>;
