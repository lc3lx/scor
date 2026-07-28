import { useEffect, useState } from 'react';
import { accountService } from '../services/accountService';
import type { SubscriptionDetails } from '../types';

export function useSubscriptionData() {
  const [subscription, setSubscription] = useState<SubscriptionDetails | null>(null);

  useEffect(() => {
    let active = true;

    const load = async () => {
      const next = await accountService.getSubscriptionDetails();
      if (active) setSubscription(next);
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
    subscription,
    isLoading: subscription === null,
  };
}

export type UseSubscriptionDataReturn = ReturnType<typeof useSubscriptionData>;
