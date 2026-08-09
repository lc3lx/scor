import { useCallback, useEffect, useMemo, useState } from 'react';
import { tradingService } from '../data/tradingService';
import { TRADING_MOCK_CONTENT } from '../data/trading.mock';
import type { TradingData, TradingRuntimeState } from '../types';

const LIVE_REFRESH_MS = 8_000;

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
      const next = await tradingService.fetchTradingData();
      if (active) setData(next);
    })();

    const timer = window.setInterval(() => {
      void (async () => {
        const next = await tradingService.fetchTradingData();
        if (active) setData(next);
      })();
    }, LIVE_REFRESH_MS);

    return () => {
      active = false;
      window.clearInterval(timer);
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
