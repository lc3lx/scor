import { brandAssets, uiAssets } from '@assets/index';
import { SHARED_CANDLE_DATA } from '@services/trades/trade.mock';
import type { TradingPageContent, TradingRuntimeState } from '../types';

export const TRADING_MOCK_CONTENT: TradingPageContent = {
  topBar: {
    connectionLabel: 'Connected',
    connectionTone: 'success',
    refreshAriaLabel: 'Refresh trading data',
    exportAriaLabel: 'Open Binolla in new window',
    refreshIconSrc: uiAssets.refresh,
    exportIconSrc: uiAssets.externalLink,
  },
  binollaCard: {
    platformLabel: 'Binolla · Embedded',
    platformIconSrc: brandAssets.binolla,
    balancePrefix: 'Balance: ',
    balanceValue: '$4,821.44',
    pairName: 'EUR/USD',
    pairSuffix: 'OTC',
    priceDisplay: '1.08423 +0.12%',
    expiryLabel: 'Expiry',
    candleData: SHARED_CANDLE_DATA,
    amountLabel: 'Amount',
    amountPrefix: '$',
    durationLabel: 'Duration',
    upLabel: 'UP',
    downLabel: 'DOWN',
    upIconSrc: uiAssets.upArrow,
    downIconSrc: uiAssets.downArrow,
  },
  signalCard: {
    brandIconSrc: brandAssets.scarTile,
    freshLabel: 'Fresh · 4s',
    freshTone: 'success',
    stats: [
      { id: 'signal', label: 'Last Signal', value: 'UP ↑', valueTone: 'success' },
      { id: 'strength', label: 'Strength', value: '82%' },
      { id: 'indicator', label: 'Indicator', value: 'Bollinger' },
      { id: 'strategy', label: 'Strategy', value: 'Alpha Momentum' },
      { id: 'market', label: 'Market', value: 'Binolla Market' },
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
  expirySeconds: 43,
};
