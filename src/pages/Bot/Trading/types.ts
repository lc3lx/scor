import type { ChipTone } from '@components/types';
import type { CandlestickPoint } from '@components/organisms/CandlestickChart';

export type {
  TradeDetailContent,
  TradeDetailRow,
  TradeTimelineEntry,
} from '@services/trades';

export type TradingDurationOption = {
  id: string;
  label: string;
  /** Seconds for trade expiry / candle period mapping */
  seconds: number;
};

export type TradingTimeframeOption = {
  id: string;
  label: string;
  /** Candle period in seconds for market API */
  periodSeconds: number;
};

export type TradingSignalStat = {
  id: string;
  label: string;
  value: string;
  valueTone?: 'success' | 'primary';
};

export type TradingTopBarContent = {
  connectionLabel: string;
  connectionTone: ChipTone;
  refreshAriaLabel: string;
  exportAriaLabel: string;
  refreshIconSrc: string;
  exportIconSrc: string;
};

export type BinollaCardContent = {
  platformLabel: string;
  platformIconSrc: string;
  balancePrefix: string;
  balanceValue: string;
  pairName: string;
  pairSuffix: string;
  priceDisplay: string;
  expiryLabel: string;
  candleData: CandlestickPoint[];
  chartStatusLabel?: string;
  amountLabel: string;
  amountPrefix: string;
  durationLabel: string;
  durationChevronSrc: string;
  upLabel: string;
  downLabel: string;
  upIconSrc: string;
  downIconSrc: string;
  tradesDisabled?: boolean;
  /** Shown when trades are locked (e.g. admin not approved). */
  tradeLockMessage?: string;
};

export type ScarAlphaSignalCardContent = {
  freshLabel: string;
  freshTone: ChipTone;
  stats: TradingSignalStat[];
  ctaLabel: string;
};

export type TradingPageContent = {
  topBar: TradingTopBarContent;
  binollaCard: BinollaCardContent;
  signalCard: ScarAlphaSignalCardContent;
  durationOptions: TradingDurationOption[];
  timeframeOptions: TradingTimeframeOption[];
};

export type TradingRuntimeState = {
  amount: string;
  durationId: string;
  /** Chart candle timeframe */
  candlePeriodId: string;
  expirySeconds: number;
};

export type TradingData = TradingPageContent & {
  runtime: TradingRuntimeState;
};
