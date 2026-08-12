import { useCallback, useEffect, useMemo, useState } from 'react';
import { tradingService } from '../data/tradingService';
import { TRADING_MOCK_CONTENT } from '../data/trading.mock';
import type { TradingData, TradingRuntimeState } from '../types';

/** Full candles/RSI refresh */
const LIVE_REFRESH_MS = 4_000;
/** Price tick — moves the active candle in near real time */
const LIVE_TICK_MS = 1_000;

export function useTradingData() {
  const [data, setData] = useState<TradingData | null>(null);

  const reload = useCallback(async () => {
    const next = await tradingService.fetchTradingData();
    setData(next);
    return next;
  }, []);

  useEffect(() => {
    let active = true;

    void (async () => {
      try {
        const next = await tradingService.fetchTradingData();
        if (active) setData(next);
      } catch {
        /* keep loading UI */
      }
    })();

    const refreshTimer = window.setInterval(() => {
      void (async () => {
        try {
          const next = await tradingService.fetchTradingData();
          if (active) setData(next);
        } catch {
          /* ignore refresh errors */
        }
      })();
    }, LIVE_REFRESH_MS);

    const tickTimer = window.setInterval(() => {
      void (async () => {
        try {
          const price = await tradingService.fetchLivePrice();
          if (!active || price == null) return;
          setData((current) =>
            current ? tradingService.applyLiveQuote(current, price) : current,
          );
        } catch {
          /* ignore tick errors */
        }
      })();
    }, LIVE_TICK_MS);

    return () => {
      active = false;
      window.clearInterval(refreshTimer);
      window.clearInterval(tickTimer);
    };
  }, []);

  const duration = useMemo(() => {
    if (!data) return null;

    const selected = data.durationOptions.find((option) => option.id === data.runtime.durationId);

    return {
      selectedId: data.runtime.durationId,
      label: selected?.label ?? TRADING_MOCK_CONTENT.durationOptions[0].label,
    };
  }, [data]);

  // Static selected duration — not a local fake countdown of an open order.
  const expiryDisplay = useMemo(() => {
    if (!duration) return '—';
    return duration.label;
  }, [duration]);

  const updateRuntime = useCallback(async (partial: Partial<TradingRuntimeState>) => {
    const runtime = await tradingService.updateRuntime(partial);
    setData((current) => (current ? { ...current, runtime } : current));
    return runtime;
  }, []);

  const placeTrade = useCallback(async (direction: 'up' | 'down') => {
    return tradingService.placeTrade(direction);
  }, []);

  return {
    data,
    duration,
    expiryDisplay,
    updateRuntime,
    placeTrade,
    reload,
  };
}

export type UseTradingDataReturn = ReturnType<typeof useTradingData>;
