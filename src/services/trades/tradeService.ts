import {
  DEFAULT_PAGE_SIZE,
  HISTORY_PAGE_CONTENT,
  SEED_TRADES,
  SHARED_CANDLE_DATA,
  TRADE_DETAIL_PAGE_TITLE,
  TRADE_DETAIL_TIMELINE_CHECK_ICON,
  TRADE_DETAIL_TIMELINE_TITLE,
} from './trade.mock';
import type {
  ListTradesParams,
  PaginatedResult,
  PlaceTradeInput,
  TradeDetailContent,
  TradeListFilter,
  TradeRecord,
} from './types';
import type { TradeDirection } from '@components/types';

type TradeChangeListener = () => void;

let trades: TradeRecord[] = SEED_TRADES.map((trade) => ({ ...trade, candleData: [...trade.candleData] }));
const listeners = new Set<TradeChangeListener>();

function cloneTrades(): TradeRecord[] {
  return trades.map((trade) => ({ ...trade, candleData: [...trade.candleData] }));
}

function notifyListeners(): void {
  listeners.forEach((listener) => listener());
}

function matchesFilter(trade: TradeRecord, filter: TradeListFilter): boolean {
  if (filter === 'all') return true;
  if (filter === 'live') return trade.status === 'running';
  if (filter === 'profit') return trade.status === 'profit';
  if (filter === 'loss') return trade.status === 'loss';
  if (filter === 'today') return trade.isToday;
  return true;
}

function formatDirectionLabel(direction: TradeDirection): string {
  return direction === 'up' ? 'Up ↑' : 'Down ↓';
}

function buildTradeRef(trade: TradeRecord): string {
  const platformLabel = trade.platform === 'global' ? 'Global' : 'Binolla';
  return `${trade.id} · ${platformLabel}`;
}

function buildDetailRows(trade: TradeRecord): TradeDetailContent['detailRows'] {
  return [
    { id: 'direction', label: 'Direction', value: formatDirectionLabel(trade.direction) },
    { id: 'amount', label: 'Amount', value: trade.stakeLabel },
    { id: 'duration', label: 'Duration', value: trade.duration },
    { id: 'entry-time', label: 'Entry time', value: trade.entryTime ?? trade.timeLabel },
    { id: 'exit-time', label: 'Exit time', value: trade.exitTime ?? '—' },
    { id: 'indicator', label: 'Indicator', value: trade.indicator },
    { id: 'strategy', label: 'Strategy', value: trade.strategy },
    { id: 'signal-strength', label: 'Signal strength', value: trade.signalStrength },
    { id: 'trade-source', label: 'Trade source', value: trade.source === 'bot' ? 'Bot' : 'User' },
    { id: 'status', label: 'Status', value: trade.status },
  ];
}

function buildTimeline(trade: TradeRecord): TradeDetailContent['timeline'] {
  const signalTime = trade.entryTime ?? trade.timeLabel;

  return [
    {
      id: 'signal-detected',
      title: 'Signal detected',
      timestamp: signalTime,
      status: 'completed',
      showCheck: true,
    },
    {
      id: 'trade-opened',
      title: 'Trade opened',
      timestamp: trade.entryTime ?? trade.timeLabel,
      status: 'completed',
      showCheck: true,
    },
    {
      id: 'trade-closed',
      title: 'Trade closed',
      timestamp: trade.exitTime ?? '—',
      status: trade.status === 'running' ? 'pending' : 'completed',
      showCheck: trade.status !== 'running',
    },
    {
      id: 'result-calculated',
      title: 'Result calculated',
      timestamp: trade.exitTime ?? '—',
      status: trade.status === 'running' ? 'pending' : 'completed',
      showCheck: false,
    },
  ];
}

function buildDetailContent(trade: TradeRecord): TradeDetailContent {
  const statusTone =
    trade.status === 'running' ? 'warning' : trade.status === 'profit' ? 'success' : 'danger';

  const statusLabel =
    trade.status === 'running' ? 'Live' : trade.status === 'profit' ? 'Won' : 'Lost';

  return {
    id: trade.id,
    pageTitle: TRADE_DETAIL_PAGE_TITLE,
    statusLabel,
    statusTone,
    hero: {
      direction: trade.direction,
      pair: trade.pair,
      tradeRef: buildTradeRef(trade),
      amountLabel: `on ${trade.stakeLabel}`,
    },
    candleData: [...trade.candleData],
    detailRows: buildDetailRows(trade),
    timelineTitle: TRADE_DETAIL_TIMELINE_TITLE,
    timelineCheckIconSrc: TRADE_DETAIL_TIMELINE_CHECK_ICON,
    timeline: buildTimeline(trade),
  };
}

function createTradeId(): string {
  return `T-${Date.now().toString().slice(-4)}`;
}

function buildTradeFromInput(input: PlaceTradeInput): TradeRecord {
  const now = new Date();
  const timeLabel = now.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  const entryTime = now.toLocaleTimeString('en-GB', { hour12: false });
  const stakeLabel = `$${input.amount}`;

  return {
    id: createTradeId(),
    pair: input.pair,
    platform: input.platform,
    strategy: input.strategy,
    indicator: input.indicator,
    duration: input.durationLabel,
    direction: input.direction,
    amount: input.amount,
    stakeLabel,
    status: 'running',
    source: input.source ?? 'user',
    timeLabel,
    isToday: true,
    liveTimerSeconds: 60,
    entryTime,
    exitTime: undefined,
    signalStrength: '82%',
    candleData: [...SHARED_CANDLE_DATA],
    openedAt: Date.now(),
  };
}

export const tradeService = {
  subscribe(listener: TradeChangeListener): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  async listTrades(params: ListTradesParams = {}): Promise<PaginatedResult<TradeRecord>> {
    const filter = params.filter ?? 'all';
    const page = params.page ?? 1;
    const pageSize = params.pageSize ?? DEFAULT_PAGE_SIZE;

    const filtered = cloneTrades().filter((trade) => matchesFilter(trade, filter));
    const start = (page - 1) * pageSize;
    const items = filtered.slice(start, start + pageSize);

    return {
      items,
      total: filtered.length,
      page,
      pageSize,
      hasMore: start + pageSize < filtered.length,
    };
  },

  async getTradeById(tradeId: string): Promise<TradeRecord | null> {
    const trade = trades.find((item) => item.id === tradeId);
    if (!trade) return null;
    return { ...trade, candleData: [...trade.candleData] };
  },

  async getTradeDetail(tradeId: string): Promise<TradeDetailContent | null> {
    const trade = await this.getTradeById(tradeId);
    if (!trade) return null;
    return buildDetailContent(trade);
  },

  async placeTrade(input: PlaceTradeInput): Promise<string> {
    const trade = buildTradeFromInput(input);
    trades = [trade, ...trades];
    notifyListeners();
    return trade.id;
  },

  getHistoryPageContent() {
    return HISTORY_PAGE_CONTENT;
  },

  reset(): void {
    trades = SEED_TRADES.map((trade) => ({ ...trade, candleData: [...trade.candleData] }));
    notifyListeners();
  },
};

export type TradeService = typeof tradeService;
