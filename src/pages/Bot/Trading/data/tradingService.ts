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
import {
  isPreferredMarketSymbol,
  pickPreferredMarketAsset,
} from '@shared/market/preferAsset';

let runtimeState: TradingRuntimeState = { ...TRADING_INITIAL_RUNTIME };
/** Last asset symbol confirmed from Binolla assets API — never invent a pair. */
let selectedAsset: string | null = null;
/** Prevent overlapping full refreshes from aborting each other. */
let fetchInFlight: Promise<TradingData> | null = null;
let livePriceInFlight = false;

const MAX_CANDLES_STORED = 200;
/** Last live quote — kept so full candle refresh cannot yank the forming candle. */
let lastLivePrice: number | null = null;
/** In-memory candle series from ticks — survives server refreshes that lag a period behind. */
let liveCandleSeries: CandlestickPoint[] = [];

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
  candles: { open: number; high: number; low: number; close: number; timestamp?: string }[],
): CandlestickPoint[] {
  const mapped = candles.map((c) => {
    let high = c.high;
    let low = c.low;
    if (low > high) {
      const t = low;
      low = high;
      high = t;
    }
    high = Math.max(high, c.open, c.close);
    low = Math.min(low, c.open, c.close);
    const timeSec = c.timestamp ? Math.floor(new Date(c.timestamp).getTime() / 1000) : undefined;
    return {
      open: c.open,
      high,
      low,
      close: c.close,
      time: Number.isFinite(timeSec) ? timeSec : undefined,
    };
  });

  // Connect closed history only — leave the forming candle's open as Binolla sent it
  // until live ticks own it (avoids visual “merge” into the previous bar).
  const stitched =
    mapped.length <= 1
      ? mapped
      : [
          ...stitchOpenToPrevClose(mapped.slice(0, -1)),
          { ...mapped[mapped.length - 1]! },
        ];

  // #region agent log
  fetch('http://127.0.0.1:7892/ingest/aea6d51e-f3e9-4c7e-b6b4-db55c4306e97', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': '660ec2' },
    body: JSON.stringify({
      sessionId: '660ec2',
      runId: 'candle-merge',
      hypothesisId: 'H90',
      location: 'tradingService.ts:mapCandles',
      message: 'candle_mapped',
      data: {
        count: stitched.length,
        lastTime: stitched[stitched.length - 1]?.time ?? null,
        lastClose: stitched[stitched.length - 1]?.close ?? null,
      },
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion

  if (stitched.length <= MAX_CANDLES_STORED) return stitched;
  return stitched.slice(stitched.length - MAX_CANDLES_STORED);
}

function bucketOf(time: number | undefined, periodSec: number, fallback: number): number {
  if (time != null && Number.isFinite(time)) {
    return Math.floor(time / periodSec) * periodSec;
  }
  return fallback;
}

/**
 * Keep locally opened candles when the server history is still on the previous period,
 * and preserve live high/low progress on the forming bar.
 */
function mergeServerWithLiveSeries(
  serverCandles: CandlestickPoint[],
  localSeries: CandlestickPoint[],
  periodSec: number,
  livePrice: number | null,
): CandlestickPoint[] {
  const nowSec = Math.floor(Date.now() / 1000);
  const nowBucket = Math.floor(nowSec / periodSec) * periodSec;

  if (serverCandles.length === 0) {
    return localSeries.length > 0 ? localSeries.map((c) => ({ ...c })) : [];
  }

  let merged = serverCandles.map((c) => ({ ...c }));
  const serverLast = merged[merged.length - 1]!;
  const serverBucket = bucketOf(serverLast.time, periodSec, nowBucket);

  if (localSeries.length > 0) {
    const newerLocal = localSeries
      .filter((c) => bucketOf(c.time, periodSec, -1) > serverBucket)
      .map((c) => ({ ...c }));

    if (newerLocal.length > 0) {
      merged = [...merged, ...newerLocal];
    } else {
      const localLast = localSeries[localSeries.length - 1]!;
      const localBucket = bucketOf(localLast.time, periodSec, nowBucket);
      if (localBucket === serverBucket) {
        // Same forming candle — keep the wider live range, prefer live close.
        const close = livePrice ?? localLast.close;
        merged[merged.length - 1] = {
          ...serverLast,
          open: serverLast.open,
          high: Math.max(serverLast.high, localLast.high, close),
          low: Math.min(serverLast.low, localLast.low, close),
          close,
          time: serverLast.time ?? localLast.time ?? serverBucket,
        };
      }
    }
  }

  // #region agent log
  fetch('http://127.0.0.1:7892/ingest/aea6d51e-f3e9-4c7e-b6b4-db55c4306e97', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': '660ec2' },
    body: JSON.stringify({
      sessionId: '660ec2',
      runId: 'candle-merge',
      hypothesisId: 'H90',
      location: 'tradingService.ts:mergeServerWithLiveSeries',
      message: 'candle_merge',
      data: {
        serverCount: serverCandles.length,
        localCount: localSeries.length,
        mergedCount: merged.length,
        serverBucket,
        nowBucket,
        keptExtra: merged.length - serverCandles.length,
      },
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion

  return merged;
}

/** Make candles touch: open[i] = close[i-1], keep high/low valid. */
function stitchOpenToPrevClose(candles: CandlestickPoint[]): CandlestickPoint[] {
  if (candles.length === 0) return candles;
  const out: CandlestickPoint[] = [{ ...candles[0]! }];
  for (let i = 1; i < candles.length; i++) {
    const prev = out[i - 1]!;
    const cur = candles[i]!;
    const open = prev.close;
    const close = cur.close;
    const high = Math.max(cur.high, open, close);
    const low = Math.min(cur.low, open, close);
    out.push({ ...cur, open, high, low, close });
  }
  return out;
}

/** Paint live quote onto the forming candle so refresh cannot jump close≠quote. */
function applyQuoteToCandles(
  candles: CandlestickPoint[],
  price: number,
  periodSec: number,
): CandlestickPoint[] {
  const nowSec = Math.floor(Date.now() / 1000);
  const bucket = Math.floor(nowSec / periodSec) * periodSec;
  const next = candles.map((c) => ({ ...c }));

  if (next.length === 0) {
    return [{ open: price, high: price, low: price, close: price, time: bucket }];
  }

  const last = next[next.length - 1]!;
  const lastBucket =
    last.time != null && Number.isFinite(last.time)
      ? Math.floor(last.time / periodSec) * periodSec
      : bucket;

  if (bucket > lastBucket) {
    // New candle opens exactly where the previous one closed.
    const open = last.close;
    next.push({
      open,
      high: Math.max(open, price),
      low: Math.min(open, price),
      close: price,
      time: bucket,
    });
    if (next.length > MAX_CANDLES_STORED) {
      return next.slice(next.length - MAX_CANDLES_STORED);
    }
    return next;
  }

  // Still the same period — update forming candle only (never rewrite prior bars).
  last.close = price;
  last.high = Math.max(last.high, price);
  last.low = Math.min(last.low, price);
  if (last.time == null) last.time = lastBucket;
  next[next.length - 1] = last;
  return next;
}

function chartStatusFor(status: AccountStatusResponse | null, hasCandles: boolean): string {
  if (!status) return 'Connect to load Binolla candles';
  if (status.botAccess === 'BinollaNotConnected') return 'Connect Binolla to load live candles';
  if (status.botAccess === 'AdminApprovalRequired') {
    return hasCandles
      ? 'Live candles — trading locked until admin approval'
      : 'No candles yet — trading locked until admin approval';
  }
  if (status.botAccess === 'NotEligible') return 'Account rejected — candles unavailable';
  if (status.botAccess === 'SessionExpired') return 'Binolla session expired — reconnect SSID';
  if (!canBrowseMarket(status.botAccess)) return 'Bot access required for live candles';
  if (!hasCandles) return 'No candles from Binolla yet';
  return 'Live Binolla candles';
}

export const tradingService = {
  async fetchTradingData(): Promise<TradingData> {
    if (fetchInFlight) return fetchInFlight;
    fetchInFlight = this.fetchTradingDataInner().finally(() => {
      fetchInFlight = null;
    });
    return fetchInFlight;
  },

  async fetchTradingDataInner(): Promise<TradingData> {
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
      const sticky =
        selectedAsset && isPreferredMarketSymbol(selectedAsset)
          ? liveAssets.find((a) => a.symbol === selectedAsset && a.available)
          : undefined;
      const preferred =
        sticky ??
        pickPreferredMarketAsset(liveAssets) ??
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
        // Separate abort signals so one slow call does not cancel the others mid-wait.
        const [price, candlesResponse, rsi] = await Promise.all([
          marketApi.price(firstAsset, timedSignal(MARKET_FETCH_MS)).catch(() => null),
          marketApi.candles(firstAsset, periodSeconds, timedSignal(MARKET_FETCH_MS)).catch(() => null),
          strategiesApi.rsiSignal(firstAsset, periodSeconds, timedSignal(MARKET_FETCH_MS)).catch(() => null),
        ]);

        content.binollaCard.priceDisplay = price ? price.price.toFixed(5) : 'Unavailable';
        let candles = candlesResponse ? mapCandles(candlesResponse.candles) : [];
        const livePx = price?.price ?? lastLivePrice;
        candles = mergeServerWithLiveSeries(candles, liveCandleSeries, periodSeconds, livePx);
        if (livePx != null && candles.length > 0) {
          candles = applyQuoteToCandles(candles, livePx, periodSeconds);
          lastLivePrice = livePx;
          content.binollaCard.priceDisplay = livePx.toFixed(5);
        }
        liveCandleSeries = candles.map((c) => ({ ...c }));
        content.binollaCard.candleData = candles;
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
    if (!selectedAsset || fetchInFlight || livePriceInFlight) return null;
    livePriceInFlight = true;
    try {
      const quote = await marketApi
        .price(selectedAsset, timedSignal(4_000))
        .catch(() => null);
      return quote?.price ?? null;
    } finally {
      livePriceInFlight = false;
    }
  },

  applyLiveQuote(current: TradingData, price: number): TradingData {
    lastLivePrice = price;
    const periodSec = candlePeriodSecondsFromId(current.runtime.candlePeriodId);
    const candles = applyQuoteToCandles(current.binollaCard.candleData, price, periodSec);
    liveCandleSeries = candles.map((c) => ({ ...c }));

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
    liveCandleSeries = [];
    lastLivePrice = null;
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
