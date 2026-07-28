import { useCallback, useEffect, useMemo, useState } from 'react';
import { homeService } from '../data/homeService';
import { HOME_MOCK_CONTENT } from '../data/home.mock';
import type { HomeConfigRow, HomeData, HomeRuntimeState } from '../types';

function resolveConfigValue(
  row: HomeConfigRow,
  runtime: HomeRuntimeState,
): string {
  if (row.sheetTarget === 'marketType') {
    const selected = HOME_MOCK_CONTENT.sheets.marketType.options.find(
      (option) => option.id === runtime.marketTypeId,
    );
    return selected?.title ?? row.value;
  }

  if (row.sheetTarget === 'tradingPair') {
    const selected = HOME_MOCK_CONTENT.sheets.tradingPair.options.find(
      (option) => option.id === runtime.tradingPairId,
    );
    return selected?.title ?? row.value;
  }

  if (row.sheetTarget === 'technicalIndicator') {
    const selected = HOME_MOCK_CONTENT.sheets.technicalIndicator.options.find(
      (option) => option.id === runtime.technicalIndicatorId,
    );
    return selected?.title ?? row.value;
  }

  if (row.sheetTarget === 'strategy') {
    const selected = HOME_MOCK_CONTENT.sheets.strategy.options.find(
      (option) => option.id === runtime.strategyId,
    );
    return selected?.title ?? row.value;
  }

  return row.value;
}

export function useHomeData() {
  const [data, setData] = useState<HomeData | null>(null);

  useEffect(() => {
    let active = true;

    homeService.fetchHomeData().then((next) => {
      if (active) setData(next);
    });

    return () => {
      active = false;
    };
  }, []);

  const configRows = useMemo(() => {
    if (!data) return [];

    return data.configRows.map((row) => ({
      ...row,
      value: resolveConfigValue(row, data.runtime),
    }));
  }, [data]);

  const tradeAmount = useMemo(() => {
    if (!data) return null;

    const selected = data.tradeAmount.options.find(
      (option) => option.id === data.runtime.tradeAmountId,
    );

    return {
      ...data.tradeAmount,
      selectedId: data.runtime.tradeAmountId,
      displayValue: selected?.label ?? data.tradeAmount.displayValue,
    };
  }, [data]);

  const duration = useMemo(() => {
    if (!data) return null;

    const selected = data.duration.options.find(
      (option) => option.id === data.runtime.durationId,
    );

    return {
      ...data.duration,
      selectedId: data.runtime.durationId,
      displayValue: selected?.label ?? data.duration.displayValue,
    };
  }, [data]);

  const updateRuntime = useCallback(async (partial: Partial<HomeRuntimeState>) => {
    const runtime = await homeService.updateRuntime(partial);
    setData((current) => (current ? { ...current, runtime } : current));
    return runtime;
  }, []);

  return {
    data,
    configRows,
    tradeAmount,
    duration,
    updateRuntime,
  };
}

export type UseHomeDataReturn = ReturnType<typeof useHomeData>;
