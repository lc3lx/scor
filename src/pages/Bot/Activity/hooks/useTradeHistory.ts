import { useEffect, useState } from 'react';
import { tradeService } from '@services/trades';
import { loadPageData, PAGE_CACHE_TTL, pageCacheKey, readCachedPageData, storePageData } from '@shared/cache/pageDataCache';
import type { PaginatedResult, TradeListFilter, TradeRecord } from '@services/trades';

const DEFAULT_PAGE_SIZE = 20;

export function useTradeHistory(filter: TradeListFilter) {
  const cacheKey = pageCacheKey(`history:${filter}`);
  const [result, setResult] = useState<PaginatedResult<TradeRecord> | null>(() => readCachedPageData(cacheKey));

  useEffect(() => {
    let active = true;

    const load = async () => {
      const next = await loadPageData(
        cacheKey,
        () => tradeService.listTrades({ filter, page: 1, pageSize: DEFAULT_PAGE_SIZE }),
        PAGE_CACHE_TTL.history,
      );
      if (active) setResult(next);
    };

    void load();

    const unsubscribe = tradeService.subscribe(() => {
      void tradeService.listTrades({ filter, page: 1, pageSize: DEFAULT_PAGE_SIZE }).then((next) => {
        storePageData(cacheKey, next, PAGE_CACHE_TTL.history);
        if (active) setResult(next);
      });
    });

    // Bot/auto trades never call notifyListeners — poll while any trade is still live.
    const pollId = window.setInterval(() => {
      void tradeService.listTrades({ filter, page: 1, pageSize: DEFAULT_PAGE_SIZE }).then((next) => {
        storePageData(cacheKey, next, PAGE_CACHE_TTL.history);
        if (active) setResult(next);
      });
    }, 8_000);

    const tickId = window.setInterval(() => {
      if (!active) return;
      setResult((current) => {
        if (!current?.items.some((t) => t.status === 'running')) return current;
        return {
          ...current,
          items: current.items.map((t) => {
            if (t.status !== 'running') return t;
            const dur = t.durationSeconds ?? 300;
            const expired = Date.now() > t.openedAt + (dur + 90) * 1000;
            if (expired) {
              return { ...t, status: 'unknown' as const, liveTimerSeconds: 0 };
            }
            const left = Math.max(0, Math.ceil((t.openedAt + dur * 1000 - Date.now()) / 1000));
            return left === t.liveTimerSeconds ? t : { ...t, liveTimerSeconds: left };
          }),
        };
      });
    }, 1000);

    return () => {
      active = false;
      unsubscribe();
      window.clearInterval(pollId);
      window.clearInterval(tickId);
    };
  }, [cacheKey, filter]);

  return {
    trades: result?.items ?? [],
    total: result?.total ?? 0,
    hasMore: result?.hasMore ?? false,
    isEmpty: (result?.total ?? 0) === 0,
    isLoading: result === null,
  };
}

export type UseTradeHistoryReturn = ReturnType<typeof useTradeHistory>;
