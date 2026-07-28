import type { CandlestickPoint } from '@components/organisms/CandlestickChart';
import type { ChipTone } from '@components/types';

export type {
  TradeDetailContent,
  TradeDetailRow,
  TradeTimelineEntry,
} from '@services/trades';

export type TradingDurationOption = {
  id: string;
  label: string;
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
  amountLabel: string;
  amountPrefix: string;
  durationLabel: string;
  upLabel: string;
  downLabel: string;
  upIconSrc: string;
  downIconSrc: string;
};

export type ScarAlphaSignalCardContent = {
  brandIconSrc: string;
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
};

export type TradingRuntimeState = {
  amount: string;
  durationId: string;
  expirySeconds: number;
};

export type TradingData = TradingPageContent & {
  runtime: TradingRuntimeState;
};
