import { useCallback, useEffect, useMemo, useState } from 'react';
import { tradingService } from '../data/tradingService';
import { TRADING_MOCK_CONTENT } from '../data/trading.mock';
import type { TradingData, TradingRuntimeState } from '../types';

export function useTradingData() {
  const [data, setData] = useState<TradingData | null>(null);

  useEffect(() => {
    let active = true;

    tradingService.fetchTradingData().then((next) => {
      if (active) setData(next);
    });

    return () => {
      active = false;
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

  const expiryDisplay = useMemo(() => {
    if (!data) return '00:00';

    const total = Math.max(0, data.runtime.expirySeconds);
    const minutes = Math.floor(total / 60);
    const seconds = total % 60;

    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }, [data]);

  const updateRuntime = useCallback(async (partial: Partial<TradingRuntimeState>) => {
    const runtime = await tradingService.updateRuntime(partial);
    setData((current) => (current ? { ...current, runtime } : current));
    return runtime;
  }, []);

  const placeTrade = useCallback(async (direction: 'up' | 'down') => {
    return tradingService.placeTrade(direction);
  }, []);

  const tickExpiry = useCallback(async () => {
    setData((current) => {
      if (!current || current.runtime.expirySeconds <= 0) return current;

      const runtime = {
        ...current.runtime,
        expirySeconds: current.runtime.expirySeconds - 1,
      };

      void tradingService.updateRuntime(runtime);
      return { ...current, runtime };
    });
  }, []);

  return {
    data,
    duration,
    expiryDisplay,
    updateRuntime,
    placeTrade,
    tickExpiry,
  };
}

export type UseTradingDataReturn = ReturnType<typeof useTradingData>;
