import { brandAssets, imageAssets, notificationAssets, uiAssets } from '@assets/index';
import type { ChipTone } from '@components/types';
import type { HomePageContent, HomeRuntimeState } from '../types';

const MARKET_GLOBAL_ID = 'global-indicators';
const MARKET_BINOLLA_ID = 'binolla-market';
const PAIR_EUR_USD_ID = 'eur-usd';
const PAIR_GBP_USD_ID = 'gbp-usd';
const PAIR_USD_JPY_ID = 'usd-jpy';
const INDICATOR_BOLLINGER_ID = 'bollinger-bands';
const INDICATOR_RSI_ID = 'rsi';
const STRATEGY_ALPHA_MOMENTUM_ID = 'alpha-momentum';
const AMOUNT_25_ID = 'amount-25';
const DURATION_1M_ID = 'duration-1m';
const RISK_MEDIUM_ID = 'risk-medium';

const COMPLEXITY_DISPLAY: Record<'low' | 'medium', { label: string; tone: ChipTone }> = {
  low: { label: 'Low', tone: 'success' },
  medium: { label: 'Medium', tone: 'warning' },
};

/**
 * Temporary Home content — replace with API responses when backend is ready.
 * Figma nodes: 222:2106 (main), 222:2234 (settings sheet), 222:2537 (chart sheet)
 */
export const HOME_MOCK_CONTENT: HomePageContent = {
  header: {
    title: 'AI Bot Engine',
    subtitle: 'Scar Alpha neural core',
  },
  botEngine: {
    name: 'Scar Alpha AI',
    iconSrc: brandAssets.botSetupLogo,
    statusLabel: 'Running',
    statusTone: 'active',
    stats: [
      { id: 'signal', label: 'Signal', value: 'UP ↑', valueTone: 'success' },
      { id: 'strength', label: 'Strength', value: '82%' },
      { id: 'updated', label: 'Updated', value: '2s ago' },
    ],
  },
  stats: [
    { id: 'balance', label: 'Balance', value: '$4,821' },
    { id: 'today-gain', label: 'Today +', value: '+$142', valueTone: 'success' },
    { id: 'today-loss', label: 'Today -', value: '-$44', valueTone: 'danger' },
    { id: 'net', label: 'Net', value: '+$98', valueTone: 'success' },
    { id: 'active', label: 'Active', value: '3', valueTone: 'warning' },
    { id: 'win-rate', label: 'Win Rate', value: '78%' },
  ],
  controls: ['start', 'pause', 'stop', 'apply'],
  configRows: [
    {
      id: 'market-type',
      iconSrc: uiAssets.marketWave,
      label: 'Market Type',
      value: 'Global Indicators',
      sheetTarget: 'marketType',
    },
    {
      id: 'trading-pair',
      iconSrc: uiAssets.tradingPair,
      label: 'Trading Pair',
      value: 'EUR/USD',
      sheetTarget: 'tradingPair',
    },
    {
      id: 'indicator',
      iconSrc: uiAssets.chart,
      label: 'Technical Indicator',
      value: 'Bollinger Bands',
      sheetTarget: 'technicalIndicator',
    },
    {
      id: 'strategy',
      iconSrc: uiAssets.botAvatar,
      label: 'Strategy',
      value: 'Alpha Momentum',
      sheetTarget: 'strategy',
    },
  ],
  tradeAmount: {
    label: 'Trade Amount',
    selectedId: AMOUNT_25_ID,
    displayValue: '$25',
    options: [
      { id: 'amount-10', label: '$10' },
      { id: AMOUNT_25_ID, label: '$25' },
      { id: 'amount-50', label: '$50' },
      { id: 'amount-100', label: '$100' },
    ],
  },
  duration: {
    label: 'Duration',
    selectedId: DURATION_1M_ID,
    displayValue: '1m',
    options: [
      { id: 'duration-30s', label: '30s' },
      { id: DURATION_1M_ID, label: '1m' },
      { id: 'duration-3m', label: '3m' },
      { id: 'duration-5m', label: '5m' },
      { id: 'duration-15m', label: '15m' },
      { id: 'duration-custom', label: 'Custom' },
    ],
  },
  riskLimits: [
    {
      id: 'profit-target',
      iconSrc: notificationAssets.profitTarget,
      label: 'Daily Profit Target',
      value: '—',
      hint: 'Managed on Binolla / not auto-enforced here',
      valueTone: 'profit',
    },
    {
      id: 'loss-limit',
      iconSrc: notificationAssets.lossLimit,
      label: 'Daily Loss Limit',
      value: '—',
      hint: 'Managed on Binolla / not auto-enforced here',
      valueTone: 'loss',
    },
  ],
  actions: [
    { id: 'show-chart', label: 'Show Chart', sheetTarget: 'chart' },
    { id: 'bot-settings', label: 'Bot Settings', sheetTarget: 'settings' },
  ],
  disclaimer: 'Demo trading on Binolla only. RSI from live candles. No automatic orders.',
  sheets: {
    chart: {
      titleTemplate: '{pair} · {duration}',
      candleData: [],
      stats: [
        { id: 'indicator', label: 'Indicator', value: 'RSI' },
        { id: 'strategy', label: 'Strategy', value: 'RSI' },
        { id: 'signal', label: 'Signal', value: 'NONE' },
      ],
    },
    settings: {
      title: 'Bot Settings',
      toggles: [
        {
          id: 'auto-profit',
          label: 'Auto Stop Profit Target (Coming Soon)',
          enabled: false,
        },
        {
          id: 'auto-loss',
          label: 'Auto Stop Loss Limit (Coming Soon)',
          enabled: false,
        },
        {
          id: 'signal-confirm',
          label: 'Signal Confirmation Mode (Coming Soon)',
          enabled: false,
        },
        {
          id: 'notifications',
          label: 'Local Notifications',
          enabled: true,
        },
      ],
      riskLabel: 'Risk Level (Coming Soon)',
      riskOptions: [
        { id: 'risk-low', label: 'Low' },
        { id: RISK_MEDIUM_ID, label: 'Medium' },
        { id: 'risk-high', label: 'High' },
      ],
      selectedRiskId: RISK_MEDIUM_ID,
      saveLabel: 'Close',
    },
    marketType: {
      title: 'Market Type',
      selectedId: MARKET_GLOBAL_ID,
      options: [
        {
          id: MARKET_GLOBAL_ID,
          title: 'Global Indicators',
          description: 'Trade using global market indicator signals.',
        },
        {
          id: MARKET_BINOLLA_ID,
          title: 'Binolla Market',
          description: 'Trade directly on Binolla market pairs.',
        },
      ],
    },
    tradingPair: {
      title: 'Trading Pair',
      searchPlaceholder: 'Search pairs',
      emptySearchMessage: 'No pairs found',
      selectedId: PAIR_EUR_USD_ID,
      options: [
        { id: PAIR_EUR_USD_ID, title: 'EUR/USD', description: 'Euro / US Dollar' },
        { id: PAIR_GBP_USD_ID, title: 'GBP/USD', description: 'British Pound / US Dollar' },
        { id: PAIR_USD_JPY_ID, title: 'USD/JPY', description: 'US Dollar / Japanese Yen' },
      ],
    },
    technicalIndicator: {
      title: 'Select Indicator',
      selectedId: INDICATOR_BOLLINGER_ID,
      options: [
        {
          id: INDICATOR_BOLLINGER_ID,
          title: 'Bollinger Bands',
          description: 'Volatility bands around a moving average.',
          bestFor: 'Best for: Trending & ranging',
          complexity: 'medium',
          previewSrc: imageAssets.indicators.bollingerBands,
        },
        {
          id: INDICATOR_RSI_ID,
          title: 'RSI',
          description: 'Relative Strength Index momentum oscillator.',
          bestFor: 'Best for: Reversal signals',
          complexity: 'low',
          previewSrc: imageAssets.indicators.rsi,
        },
        {
          id: 'macd',
          title: 'MACD',
          description: 'Trend-following momentum indicator.',
          bestFor: 'Best for: Trending markets',
          complexity: 'medium',
          previewSrc: imageAssets.indicators.macd,
        },
        {
          id: 'moving-average',
          title: 'Moving Average',
          description: 'Smooths price action to identify trend.',
          bestFor: 'Best for: Trend confirmation',
          complexity: 'low',
          previewSrc: imageAssets.indicators.movingAverage,
        },
        {
          id: 'stochastic',
          title: 'Stochastic',
          description: 'Momentum oscillator comparing closes.',
          bestFor: 'Best for: Overbought / oversold',
          complexity: 'medium',
          previewSrc: imageAssets.indicators.stochastic,
        },
        {
          id: 'support-resistance',
          title: 'Support & Resistance',
          description: 'Key price levels for entries.',
          bestFor: 'Best for: Range trading',
          complexity: 'low',
          previewSrc: imageAssets.indicators.supportResistance,
        },
        {
          id: 'trend-indicator',
          title: 'Trend Indicator',
          description: 'Detects prevailing market trend.',
          bestFor: 'Best for: Momentum plays',
          complexity: 'medium',
          previewSrc: imageAssets.indicators.trendIndicator,
        },
      ],
    },
    strategy: {
      title: 'Select Strategy',
      selectedId: STRATEGY_ALPHA_MOMENTUM_ID,
      options: [
        {
          id: STRATEGY_ALPHA_MOMENTUM_ID,
          title: 'Alpha Momentum',
          stats: [
            { label: 'Risk', value: 'Medium' },
            { label: 'Markets', value: 'Global' },
            { label: 'Duration', value: '1–5m' },
            { label: 'Indicators', value: 'MACD + RSI' },
          ],
          successRate: 'Success ~78%',
          previewSrc: imageAssets.strategies.alphaMomentum,
        },
        {
          id: 'scar-precision',
          title: 'Scar Precision',
          stats: [
            { label: 'Risk', value: 'Low' },
            { label: 'Markets', value: 'Global · Binolla' },
            { label: 'Duration', value: '3–15m' },
            { label: 'Indicators', value: 'Bollinger + MA' },
          ],
          successRate: 'Success ~82%',
          previewSrc: imageAssets.strategies.scarPrecision,
        },
        {
          id: 'red-signal-pro',
          title: 'Red Signal Pro',
          stats: [
            { label: 'Risk', value: 'High' },
            { label: 'Markets', value: 'Binolla' },
            { label: 'Duration', value: '30s–1m' },
            { label: 'Indicators', value: 'Stochastic + Trend' },
          ],
          successRate: 'Success ~74%',
          previewSrc: imageAssets.strategies.redSignalPro,
        },
        {
          id: 'trend-breaker',
          title: 'Trend Breaker',
          stats: [
            { label: 'Risk', value: 'Medium' },
            { label: 'Markets', value: 'Global' },
            { label: 'Duration', value: '5–15m' },
            { label: 'Indicators', value: 'MA + S/R' },
          ],
          successRate: 'Success ~71%',
          previewSrc: imageAssets.strategies.trendBreaker,
        },
        {
          id: 'otc-hunter',
          title: 'OTC Hunter',
          stats: [
            { label: 'Risk', value: 'High' },
            { label: 'Markets', value: 'Binolla OTC' },
            { label: 'Duration', value: '30s–3m' },
            { label: 'Indicators', value: 'RSI + Trend' },
          ],
          successRate: 'Success ~80%',
          previewSrc: imageAssets.strategies.otcHunter,
        },
      ],
    },
  },
};

export const HOME_INITIAL_RUNTIME: HomeRuntimeState = {
  botStatus: 'stopped',
  marketTypeId: MARKET_BINOLLA_ID,
  tradingPairId: 'EURUSD_otc',
  technicalIndicatorId: INDICATOR_RSI_ID,
  strategyId: 'rsi',
  tradeAmountId: AMOUNT_25_ID,
  durationId: DURATION_1M_ID,
  settings: HOME_MOCK_CONTENT.sheets.settings,
};

export const HOME_SHEET_TITLES = {
  settings: HOME_MOCK_CONTENT.sheets.settings.title,
  marketType: HOME_MOCK_CONTENT.sheets.marketType.title,
  tradingPair: HOME_MOCK_CONTENT.sheets.tradingPair.title,
  technicalIndicator: HOME_MOCK_CONTENT.sheets.technicalIndicator.title,
  strategy: HOME_MOCK_CONTENT.sheets.strategy.title,
} as const;

export const BOT_STATUS_DISPLAY: Record<
  HomeRuntimeState['botStatus'],
  { label: string; tone: ChipTone }
> = {
  // Start only enables RSI monitoring — it never places Binolla orders automatically.
  running: { label: 'RSI Monitor', tone: 'active' },
  paused: { label: 'Paused', tone: 'warning' },
  stopped: { label: 'Manual Trade', tone: 'neutral' },
};

export { COMPLEXITY_DISPLAY };
