import {
  TRADING_INITIAL_RUNTIME,
  TRADING_MOCK_CONTENT,
} from './trading.mock';
import { activityService } from '../../Activity/data/activityService';
import { tradeService } from '@services/trades';
import type { TradingData, TradingRuntimeState } from '../types';
import type { TradeDirection } from '@components/types';
import type { CandlestickPoint } from '@components/organisms/CandlestickChart';
import {
  accountApi,
  ApiClientError,
  binollaApi,
  marketApi,
  strategiesApi,
  type AccountStatusResponse,
} from '@shared/api';
import {
  ADMIN_NOT_APPROVED_TRADE_MESSAGE,
  canBrowseMarket,
  canTrade,
} from '@shared/access/botAccess';
import { MARKET_FETCH_MS, timedSignal } from '@shared/api/timedSignal';

let runtimeState: TradingRuntimeState = { ...TRADING_INITIAL_RUNTIME };
/** Last asset symbol confirmed from Binolla assets API — never invent a pair. */
let selectedAsset: string | null = null;

const MAX_CANDLES_ON_CHART = 56;

function cloneRuntime(): TradingRuntimeState {
  return { ...runtimeState };
}

function formatMoney(value: number): string {
  return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatSignal(signal: string): { value: string; tone?: 'success' | 'primary' } {
  const s = signal.toLowerCase();
  if (s === 'call') return { value: 'CALL ↑', tone: 'success' };
  if (s === 'put') return { value: 'PUT ↓', tone: 'primary' };
  return { value: 'NONE', tone: 'primary' };
}

function durationSecondsFromId(id: string): number {
  const opt = TRADING_MOCK_CONTENT.durationOptions.find((o) => o.id === id);
  return opt?.seconds ?? 60;
}

function candlePeriodSecondsFromId(id: string): number {
  const opt = TRADING_MOCK_CONTENT.timeframeOptions.find((o) => o.id === id);
  return opt?.periodSeconds ?? 60;
}

function mapCandles(
  candles: { open: number; high: number; low: number; close: number }[],
): CandlestickPoint[] {
  const mapped = candles.map((c) => ({
    open: c.open,
    high: c.high,
    low: c.low,
    close: c.close,
  }));
  if (mapped.length <= MAX_CANDLES_ON_CHART) return mapped;
  return mapped.slice(mapped.length - MAX_CANDLES_ON_CHART);
}

function chartStatusFor(status: AccountStatusResponse | null, hasCandles: boolean): string {
  if (!status) return 'Connect to load Binolla candles';
  if (status.botAccess === 'BinollaNotConnected') return 'Connect Binolla to load live candles';
  if (status.botAccess === 'AdminApprovalRequired') {
    return hasCandles
      ? 'Live candles — trading locked until admin approval'
      : 'Loading candles — trading locked until admin approval';
  }
  if (status.botAccess === 'NotEligible') return 'Account rejected — candles unavailable';
  if (status.botAccess === 'SessionExpired') return 'Binolla session expired — reconnect SSID';
  if (!canBrowseMarket(status.botAccess)) return 'Bot access required for live candles';
  if (!hasCandles) return 'No candles from Binolla yet';
  return 'Live Binolla candles';
}

export const tradingService = {
  async fetchTradingData(): Promise<TradingData> {
    const content = structuredClone(TRADING_MOCK_CONTENT);
    content.binollaCard.candleData = [];
    content.binollaCard.balanceValue = '—';
    content.binollaCard.priceDisplay = '—';

    try {
      const [status, balance] = await Promise.all([
        accountApi.status().catch(() => null),
        binollaApi.balance(timedSignal(MARKET_FETCH_MS)).catch(() => null),
      ]);

      const connected = Boolean(status?.binollaConnected && balance?.connected);
      content.topBar.connectionLabel = connected ? 'Connected' : 'Disconnected';
      content.topBar.connectionTone = connected ? 'success' : 'danger';

      if (balance) {
        content.binollaCard.balanceValue = formatMoney(balance.currentBalance);
      }

      if (status?.botAccess === 'AdminApprovalRequired') {
        content.topBar.connectionLabel = 'Awaiting approval';
        content.topBar.connectionTone = 'warning';
      }

      const browse = canBrowseMarket(status?.botAccess);
      const tradeOk = canTrade(status?.botAccess);
      content.binollaCard.tradesDisabled = !tradeOk;
      content.binollaCard.tradeLockMessage =
        status?.botAccess === 'AdminApprovalRequired'
          ? ADMIN_NOT_APPROVED_TRADE_MESSAGE
          : !tradeOk
            ? 'Trading is not available for this account.'
            : undefined;

      const assets = browse
        ? await marketApi.assets(timedSignal(MARKET_FETCH_MS)).catch(() => null)
        : null;
      const liveAssets = assets?.assets ?? [];
      const preferred =
        (selectedAsset
          ? liveAssets.find((a) => a.symbol === selectedAsset && a.available)
          : undefined) ??
        liveAssets.find((a) => a.available) ??
        liveAssets[0];
      const firstAsset = preferred?.symbol ?? null;
      selectedAsset = firstAsset;

      if (!firstAsset) {
        content.binollaCard.pairName = browse ? 'No pairs' : '—';
        content.binollaCard.pairSuffix = '';
        content.binollaCard.priceDisplay = browse ? 'Unavailable' : '—';
        content.binollaCard.candleData = [];
        content.binollaCard.chartStatusLabel = browse
          ? 'No assets from Binolla session'
          : chartStatusFor(status, false);
        content.signalCard.freshLabel = browse ? 'No assets' : 'Awaiting access';
        content.signalCard.freshTone = 'neutral';
        content.signalCard.stats = [
          { id: 'signal', label: 'Last Signal', value: 'NONE' },
          { id: 'strength', label: 'RSI', value: '—' },
          { id: 'indicator', label: 'Indicator', value: 'RSI' },
          { id: 'strategy', label: 'Strategy', value: 'RSI' },
          { id: 'market', label: 'Market', value: '—' },
        ];
      } else {
        const displayName = preferred?.name ?? firstAsset;
        content.binollaCard.pairName = displayName.includes('/')
          ? displayName.split(' ')[0] ?? displayName
          : firstAsset.replace('_otc', '');
        content.binollaCard.pairSuffix = firstAsset.toLowerCase().includes('otc') ? 'OTC' : '';

        const periodSeconds = candlePeriodSecondsFromId(runtimeState.candlePeriodId);
        const signal = timedSignal(MARKET_FETCH_MS);
        const [price, candlesResponse, rsi] = await Promise.all([
          marketApi.price(firstAsset, signal).catch(() => null),
          marketApi.candles(firstAsset, periodSeconds, signal).catch(() => null),
          strategiesApi.rsiSignal(firstAsset, periodSeconds, signal).catch(() => null),
        ]);

        content.binollaCard.priceDisplay = price ? price.price.toFixed(5) : 'Unavailable';
        content.binollaCard.candleData = candlesResponse
          ? mapCandles(candlesResponse.candles)
          : [];
        content.binollaCard.chartStatusLabel = chartStatusFor(
          status,
          content.binollaCard.candleData.length > 0,
        );

        if (rsi) {
          const mapped = formatSignal(rsi.signal);
          content.signalCard.freshLabel = `RSI ${rsi.rsi.toFixed(2)}`;
          content.signalCard.freshTone =
            rsi.signal.toLowerCase() === 'none' ? 'neutral' : 'success';
          content.signalCard.stats = [
            { id: 'signal', label: 'Last Signal', value: mapped.value, valueTone: mapped.tone },
            { id: 'strength', label: 'RSI', value: rsi.rsi.toFixed(2) },
            { id: 'indicator', label: 'Indicator', value: 'RSI' },
            { id: 'strategy', label: 'Strategy', value: 'RSI' },
            { id: 'market', label: 'Market', value: firstAsset },
            {
              id: 'candle',
              label: 'Candle',
              value: new Date(rsi.candleTime).toLocaleTimeString('en-GB', { hour12: false }),
            },
            { id: 'timeframe', label: 'Timeframe', value: `${rsi.timeframe}s` },
          ];
        } else {
          content.signalCard.freshLabel = 'No signal';
          content.signalCard.freshTone = 'neutral';
          content.signalCard.stats = [
            { id: 'signal', label: 'Last Signal', value: 'NONE' },
            { id: 'strength', label: 'RSI', value: '—' },
            { id: 'indicator', label: 'Indicator', value: 'RSI' },
            { id: 'strategy', label: 'Strategy', value: 'RSI' },
            { id: 'market', label: 'Market', value: firstAsset },
          ];
        }
      }
    } catch (error) {
      content.topBar.connectionLabel = 'Error';
      content.topBar.connectionTone = 'danger';
      content.binollaCard.balanceValue = '—';
      content.binollaCard.priceDisplay = 'Unavailable';
      content.binollaCard.candleData = [];
      content.binollaCard.chartStatusLabel =
        error instanceof ApiClientError ? error.message : 'Unable to load Binolla chart';
      if (error instanceof ApiClientError) {
        content.signalCard.freshLabel = error.code;
      }
    }

    return {
      ...content,
      runtime: cloneRuntime(),
    };
  },

  /** Lightweight tick: update last candle + price from live quote only. */
  async fetchLivePrice(): Promise<number | null> {
    if (!selectedAsset) return null;
    const quote = await marketApi
      .price(selectedAsset, timedSignal(4_000))
      .catch(() => null);
    return quote?.price ?? null;
  },

  applyLiveQuote(current: TradingData, price: number): TradingData {
    const candles = current.binollaCard.candleData.map((c) => ({ ...c }));
    if (candles.length > 0) {
      const last = candles[candles.length - 1]!;
      last.close = price;
      last.high = Math.max(last.high, price);
      last.low = Math.min(last.low, price);
      candles[candles.length - 1] = last;
    }

    return {
      ...current,
      binollaCard: {
        ...current.binollaCard,
        priceDisplay: price.toFixed(5),
        candleData: candles,
        chartStatusLabel:
          candles.length > 0
            ? 'Live Binolla candles'
            : current.binollaCard.chartStatusLabel,
      },
      runtime: current.runtime,
    };
  },

  async updateRuntime(partial: Partial<TradingRuntimeState>): Promise<TradingRuntimeState> {
    const next = { ...runtimeState, ...partial };
    // Keep expiry display tied to the selected Binolla trade duration — not a fake timer.
    if (partial.durationId && partial.expirySeconds === undefined) {
      next.expirySeconds = durationSecondsFromId(partial.durationId);
    }
    runtimeState = next;
    return cloneRuntime();
  },

  /** Cycle trade duration: 1m → 5m → 15m → 1h → … */
  async cycleTradeDuration(): Promise<TradingRuntimeState> {
    const options = TRADING_MOCK_CONTENT.durationOptions;
    const idx = Math.max(
      0,
      options.findIndex((o) => o.id === runtimeState.durationId),
    );
    const next = options[(idx + 1) % options.length]!;
    return this.updateRuntime({
      durationId: next.id,
      expirySeconds: next.seconds,
    });
  },

  async setCandlePeriod(candlePeriodId: string): Promise<TradingRuntimeState> {
    const opt = TRADING_MOCK_CONTENT.timeframeOptions.find((o) => o.id === candlePeriodId);
    if (!opt) return cloneRuntime();
    return this.updateRuntime({ candlePeriodId: opt.id });
  },

  getCandlePeriodSeconds(): number {
    return candlePeriodSecondsFromId(runtimeState.candlePeriodId);
  },

  async placeTrade(direction: TradeDirection): Promise<string> {
    const status = await accountApi.status().catch(() => null);
    if (!canTrade(status?.botAccess)) {
      throw new ApiClientError(
        status?.botAccess === 'AdminApprovalRequired'
          ? 'ADMIN_APPROVAL_REQUIRED'
          : status?.botAccess === 'NotEligible'
            ? 'NOT_ELIGIBLE'
            : 'BINOLLA_NOT_CONNECTED',
        status?.botAccess === 'AdminApprovalRequired'
          ? ADMIN_NOT_APPROVED_TRADE_MESSAGE
          : 'Trading is not available for this account.',
        403,
      );
    }

    if (!selectedAsset) {
      throw new ApiClientError(
        'MARKET_UNAVAILABLE',
        'No Binolla asset is available for trading yet.',
        503,
      );
    }

    const amount = Number.parseFloat(runtimeState.amount) || 25;
    const durationOption = TRADING_MOCK_CONTENT.durationOptions.find(
      (option) => option.id === runtimeState.durationId,
    );
    const durationLabel = durationOption?.label ?? '1 min';
    const durationSeconds = durationSecondsFromId(runtimeState.durationId);

    const tradeId = await tradeService.placeTrade({
      direction,
      pair: selectedAsset,
      platform: 'binolla',
      amount,
      durationLabel: `${durationSeconds}s`,
      strategy: 'rsi',
      indicator: 'RSI',
      source: 'user',
    });

    // After a live Binolla order, countdown matches that order's duration.
    runtimeState = { ...runtimeState, expirySeconds: durationSeconds };

    await activityService.addTradeNotification({
      tradeId,
      description: `$${amount} ${direction.toUpperCase()} on ${selectedAsset} · ${durationLabel} expiry.`,
    });

    return tradeId;
  },

  async getTradeDetail(tradeId: string) {
    return tradeService.getTradeDetail(tradeId);
  },

  getSelectedAsset(): string | null {
    return selectedAsset;
  },

  /** Switch pair only to a symbol previously returned by GET /api/market/assets. */
  setSelectedAsset(symbol: string): void {
    const cleaned = symbol.trim();
    if (cleaned) selectedAsset = cleaned;
  },

  resetRuntime(): void {
    runtimeState = { ...TRADING_INITIAL_RUNTIME };
    selectedAsset = null;
  },
};
