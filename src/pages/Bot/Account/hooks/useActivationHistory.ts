import { useEffect, useState } from 'react';
import { accountService } from '../services/accountService';
import type { ActivationHistoryEntry } from '../types';

export function useActivationHistory() {
  const [entries, setEntries] = useState<ActivationHistoryEntry[] | null>(null);

  useEffect(() => {
    let active = true;

    const load = async () => {
      const next = await accountService.getActivationHistory();
      if (active) setEntries(next);
    };

    void load();

    const unsubscribe = accountService.subscribe(() => {
      void load();
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  return {
    entries: entries ?? [],
    isLoading: entries === null,
  };
}

export type UseActivationHistoryReturn = ReturnType<typeof useActivationHistory>;
