import { tradingAssets } from '@assets/index';
import type { TradingPageContent, TradingRuntimeState } from '../types';

export const TRADING_MOCK_CONTENT: TradingPageContent = {
  topBar: {
    connectionLabel: 'Connected',
    connectionTone: 'success',
    refreshAriaLabel: 'Refresh trading data',
    exportAriaLabel: 'Open Binolla in new window',
    refreshIconSrc: tradingAssets.refresh,
    exportIconSrc: tradingAssets.externalLink,
  },
  binollaCard: {
    platformLabel: 'Binolla · Live',
    platformIconSrc: tradingAssets.binollaIcon,
    balancePrefix: 'Balance: ',
    balanceValue: '—',
    pairName: 'EUR/USD',
    pairSuffix: 'OTC',
    priceDisplay: '—',
    expiryLabel: 'Duration',
    candleData: [],
    chartStatusLabel: 'Waiting for Binolla candles…',
    amountLabel: 'Amount',
    amountPrefix: '$',
    durationLabel: 'Duration',
    durationChevronSrc: tradingAssets.durationChevron,
    upLabel: 'UP',
    downLabel: 'DOWN',
    upIconSrc: tradingAssets.tradeUp,
    downIconSrc: tradingAssets.tradeDown,
  },
  signalCard: {
    freshLabel: 'Awaiting access',
    freshTone: 'neutral',
    stats: [
      { id: 'signal', label: 'Last Signal', value: 'NONE' },
      { id: 'strength', label: 'RSI', value: '—' },
      { id: 'indicator', label: 'Indicator', value: 'RSI' },
      { id: 'strategy', label: 'Strategy', value: 'RSI' },
      { id: 'market', label: 'Market', value: '—' },
    ],
    ctaLabel: 'Open AI Bot',
  },
  durationOptions: [
    { id: 'duration-1m', label: '1 min' },
    { id: 'duration-3m', label: '3 min' },
    { id: 'duration-5m', label: '5 min' },
  ],
};

export const TRADING_INITIAL_RUNTIME: TradingRuntimeState = {
  amount: '25',
  durationId: 'duration-1m',
  // Matches selected duration (1 min). Never use a fake countdown seed.
  expirySeconds: 60,
};
