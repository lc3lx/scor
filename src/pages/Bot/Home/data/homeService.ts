import { imageAssets } from '@assets/index';
import { HOME_INITIAL_RUNTIME, HOME_MOCK_CONTENT } from './home.mock';
import type { HomeData, HomeRuntimeState, StrategyOptionItem } from '../types';
import {
  accountApi,
  ApiClientError,
  binollaApi,
  marketApi,
  strategiesApi,
} from '@shared/api';
import { canBrowseMarket } from '@shared/access/botAccess';

let runtimeState: HomeRuntimeState = {
  ...HOME_INITIAL_RUNTIME,
  strategyId: 'rsi',
  technicalIndicatorId: 'rsi',
  settings: {
    ...HOME_INITIAL_RUNTIME.settings,
    toggles: [...HOME_INITIAL_RUNTIME.settings.toggles],
    riskOptions: [...HOME_INITIAL_RUNTIME.settings.riskOptions],
  },
};

function cloneRuntime(): HomeRuntimeState {
  return {
    ...runtimeState,
    settings: {
      ...runtimeState.settings,
      toggles: runtimeState.settings.toggles.map((toggle) => ({ ...toggle })),
      riskOptions: [...runtimeState.settings.riskOptions],
    },
  };
}

function formatMoney(value: number): string {
  return `$${value.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

function formatSignal(signal: string): string {
  const s = signal.toLowerCase();
  if (s === 'call') return 'CALL ↑';
  if (s === 'put') return 'PUT ↓';
  return 'NONE';
}

function strategyPreview(id: string): string {
  if (id === 'rsi') return imageAssets.strategies.otcHunter;
  if (id === 'ema') return imageAssets.strategies.alphaMomentum;
  if (id === 'macd') return imageAssets.strategies.scarPrecision;
  return imageAssets.strategies.redSignalPro;
}

export const homeService = {
  async fetchHomeData(): Promise<HomeData> {
    const base = structuredClone(HOME_MOCK_CONTENT);
    let asset = 'EURUSD_otc';

    try {
      const [status, balance, strategies] = await Promise.all([
        accountApi.status().catch(() => null),
        binollaApi.balance().catch(() => null),
        strategiesApi.list().catch(() => null),
      ]);

      const assets =
        canBrowseMarket(status?.botAccess) ? await marketApi.assets().catch(() => null) : null;

      if (assets?.assets?.length) {
        const options = assets.assets.map((a) => ({
          id: a.symbol,
          title: a.name || a.symbol,
          description: a.available ? 'Available' : 'Unavailable',
        }));
        base.sheets.tradingPair.options = options;
        asset = options.find((o) => o.id === runtimeState.tradingPairId)?.id ?? options[0]?.id ?? asset;
        runtimeState.tradingPairId = asset;
        base.sheets.tradingPair.selectedId = asset;
      }

      if (strategies?.strategies?.length) {
        const strategyOptions: StrategyOptionItem[] = strategies.strategies.map((s) => ({
          id: s.id,
          title: s.name,
          stats: [
            { label: 'Status', value: s.status },
            { label: 'Enabled', value: s.enabled ? 'Yes' : 'No' },
            { label: 'Access', value: s.enabled ? 'Selectable' : 'Coming Soon' },
            { label: 'Source', value: 'Server' },
          ],
          successRate: s.enabled ? 'Active' : 'Coming Soon',
          previewSrc: strategyPreview(s.id),
          enabled: s.enabled,
        }));

        base.sheets.strategy.options = strategyOptions;
        const enabled = strategies.strategies.find((s) => s.enabled)?.id ?? 'rsi';
        if (!strategies.strategies.some((s) => s.id === runtimeState.strategyId && s.enabled)) {
          runtimeState.strategyId = enabled;
        }
        base.sheets.strategy.selectedId = runtimeState.strategyId;
      }

      // Indicators: keep RSI as the only meaningful selection tied to active strategy.
      base.sheets.technicalIndicator.selectedId = 'rsi';
      runtimeState.technicalIndicatorId = 'rsi';
      base.sheets.technicalIndicator.options = base.sheets.technicalIndicator.options.map((opt) =>
        opt.id === 'rsi'
          ? opt
          : {
              ...opt,
              description: `${opt.description} (Coming Soon)`,
              bestFor: 'Disabled — server strategy registry',
            },
      );

      if (balance) {
        base.stats = base.stats.map((stat) =>
          stat.id === 'balance' ? { ...stat, value: formatMoney(balance.currentBalance) } : stat,
        );
      } else {
        base.stats = base.stats.map((stat) =>
          stat.id === 'balance' ? { ...stat, value: '—' } : { ...stat, value: '—' },
        );
      }

      // Do not invent P/L aggregates — clear fake totals until backend provides them.
      base.stats = base.stats.map((stat) => {
        if (stat.id === 'balance') return stat;
        if (stat.id === 'active') return { ...stat, value: '—' };
        if (stat.id === 'win-rate') return { ...stat, value: '—' };
        if (stat.id === 'today-gain') return { ...stat, value: '—' };
        if (stat.id === 'today-loss') return { ...stat, value: '—' };
        if (stat.id === 'net') return { ...stat, value: '—' };
        return stat;
      });

      const signal =
        canBrowseMarket(status?.botAccess)
          ? await strategiesApi.rsiSignal(asset, 60).catch(() => null)
          : null;
      if (signal) {
        base.botEngine.stats = [
          {
            id: 'signal',
            label: 'Signal',
            value: formatSignal(signal.signal),
            valueTone: signal.signal.toLowerCase() === 'call' ? 'success' : 'primary',
          },
          { id: 'strength', label: 'RSI', value: signal.rsi.toFixed(2) },
          {
            id: 'updated',
            label: 'Candle',
            value: new Date(signal.candleTime).toLocaleTimeString('en-GB', { hour12: false }),
          },
        ];
      } else {
        base.botEngine.stats = [
          { id: 'signal', label: 'Signal', value: 'NONE' },
          { id: 'strength', label: 'RSI', value: '—' },
          { id: 'updated', label: 'Candle', value: '—' },
        ];
      }

      try {
        const candles =
          canBrowseMarket(status?.botAccess)
            ? await marketApi.candles(asset, 60)
            : null;
        const mapped = candles
          ? candles.candles.map((c) => ({
              open: c.open,
              high: c.high,
              low: c.low,
              close: c.close,
            }))
          : [];
        base.sheets.chart.candleData =
          mapped.length > 48 ? mapped.slice(mapped.length - 48) : mapped;
        base.sheets.chart.stats = [
          { id: 'indicator', label: 'Indicator', value: 'RSI' },
          {
            id: 'strategy',
            label: 'Strategy',
            value: strategies?.strategies.find((s) => s.id === runtimeState.strategyId)?.name ?? 'RSI',
          },
          {
            id: 'signal',
            label: 'Signal',
            value: signal ? formatSignal(signal.signal) : 'NONE',
            valueTone: signal?.signal.toLowerCase() === 'call' ? 'success' : undefined,
          },
        ];
      } catch {
        base.sheets.chart.candleData = [];
      }

      const strategyName =
        strategies?.strategies.find((s) => s.id === runtimeState.strategyId)?.name ?? 'RSI';
      const pairName =
        base.sheets.tradingPair.options.find((o) => o.id === runtimeState.tradingPairId)?.title ??
        asset;

      base.configRows = base.configRows.map((row) => {
        if (row.id === 'trading-pair') return { ...row, value: pairName };
        if (row.id === 'indicator') return { ...row, value: 'RSI' };
        if (row.id === 'strategy') return { ...row, value: strategyName };
        if (row.id === 'market-type') return { ...row, value: 'Binolla Market' };
        return row;
      });

      if (status?.botAccess === 'AdminApprovalRequired') {
        base.disclaimer =
          'Administrator has not approved your account yet. Markets and RSI work; trading unlocks after approval.';
      } else if (status?.botAccess === 'BinollaNotConnected') {
        base.disclaimer = 'Connect your Binolla account in Account settings to use market data and trading.';
      } else if (status?.botAccess === 'NotEligible') {
        base.disclaimer = 'This account was rejected by an administrator.';
      } else if (status?.botAccess === 'SessionExpired') {
        base.disclaimer = 'Your Binolla session expired. Reconnect your SSID in Account settings.';
      } else {
        base.disclaimer =
          'All market data and orders come from Binolla (Demo). RSI is computed from live Binolla candles. Auto Start/Pause/Stop is Coming Soon — place Demo trades manually on Trading.';
      }

      // Keep risk cards empty — no local fake profit/loss targets.
      base.riskLimits = base.riskLimits.map((limit) => ({
        ...limit,
        value: '—',
        hint: 'Coming Soon — not enforced by this bot',
      }));

      // Home amount/duration are not wired to Binolla place-order (Trading page is).
      base.tradeAmount = {
        ...base.tradeAmount,
        label: 'Trade Amount (Coming Soon — set on Trading)',
      };
      base.duration = {
        ...base.duration,
        label: 'Duration (Coming Soon — set on Trading)',
      };

      runtimeState.marketTypeId = 'binolla-market';
      runtimeState.botStatus = 'stopped';
      if (runtimeState.settings) {
        runtimeState.settings = {
          ...runtimeState.settings,
          toggles: runtimeState.settings.toggles.map((t) =>
            t.id === 'notifications' ? t : { ...t, enabled: false },
          ),
        };
      }
    } catch (error) {
      if (error instanceof ApiClientError) {
        base.disclaimer = error.message;
      }
      base.sheets.chart.candleData = [];
      base.botEngine.stats = [
        { id: 'signal', label: 'Signal', value: 'NONE' },
        { id: 'strength', label: 'RSI', value: '—' },
        { id: 'updated', label: 'Candle', value: '—' },
      ];
    }

    return {
      ...base,
      runtime: cloneRuntime(),
    };
  },

  async updateRuntime(partial: Partial<HomeRuntimeState>): Promise<HomeRuntimeState> {
    // Never simulate auto-trading run state locally.
    if (partial.botStatus) {
      partial = { ...partial, botStatus: 'stopped' };
    }

    if (partial.strategyId) {
      try {
        const strategies = await strategiesApi.list();
        const selected = strategies.strategies.find((s) => s.id === partial.strategyId);
        if (!selected?.enabled) {
          // Backend is authoritative — ignore disabled strategy selection.
          partial = { ...partial, strategyId: runtimeState.strategyId };
        }
      } catch {
        partial = { ...partial, strategyId: runtimeState.strategyId };
      }
    }

    if (partial.technicalIndicatorId && partial.technicalIndicatorId !== 'rsi') {
      partial = { ...partial, technicalIndicatorId: 'rsi' };
    }

    if (partial.settings?.toggles) {
      partial = {
        ...partial,
        settings: {
          ...partial.settings,
          toggles: partial.settings.toggles.map((t) =>
            t.id.startsWith('auto-') || t.id === 'signal-confirm'
              ? { ...t, enabled: false }
              : t,
          ),
        },
      };
    }

    runtimeState = {
      ...runtimeState,
      ...partial,
      botStatus: 'stopped',
      settings: partial.settings
        ? {
            ...runtimeState.settings,
            ...partial.settings,
            toggles: partial.settings.toggles ?? runtimeState.settings.toggles,
            riskOptions: partial.settings.riskOptions ?? runtimeState.settings.riskOptions,
          }
        : runtimeState.settings,
    };

    return cloneRuntime();
  },

  resetRuntime(): void {
    runtimeState = {
      ...HOME_INITIAL_RUNTIME,
      strategyId: 'rsi',
      technicalIndicatorId: 'rsi',
      settings: {
        ...HOME_INITIAL_RUNTIME.settings,
        toggles: HOME_INITIAL_RUNTIME.settings.toggles.map((toggle) => ({ ...toggle })),
        riskOptions: [...HOME_INITIAL_RUNTIME.settings.riskOptions],
      },
    };
  },
};
