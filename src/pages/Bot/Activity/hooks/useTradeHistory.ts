import { useEffect, useState } from 'react';
import { tradeService } from '@services/trades';
import type { PaginatedResult, TradeListFilter, TradeRecord } from '@services/trades';

const DEFAULT_PAGE_SIZE = 20;

export function useTradeHistory(filter: TradeListFilter) {
  const [result, setResult] = useState<PaginatedResult<TradeRecord> | null>(null);

  useEffect(() => {
    let active = true;

    const load = async () => {
      const next = await tradeService.listTrades({ filter, page: 1, pageSize: DEFAULT_PAGE_SIZE });
      if (active) setResult(next);
    };

    void load();

    const unsubscribe = tradeService.subscribe(() => {
      void load();
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, [filter]);

  return {
    trades: result?.items ?? [],
    total: result?.total ?? 0,
    hasMore: result?.hasMore ?? false,
    isEmpty: (result?.total ?? 0) === 0,
    isLoading: result === null,
  };
}

export type UseTradeHistoryReturn = ReturnType<typeof useTradeHistory>;
