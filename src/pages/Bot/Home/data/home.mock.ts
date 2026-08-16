import { brandAssets, imageAssets, notificationAssets, uiAssets } from '@assets/index';
import type { ChipTone } from '@components/types';
import { t } from '@shared/i18n';
import type { HomePageContent, HomeRuntimeState } from '../types';

const MARKET_BINOLLA_ID = 'binolla-market';
const INDICATOR_RSI_ID = 'rsi';
const RISK_MEDIUM_ID = 'risk-medium';

/**
 * Honest Home shell — labels/i18n only. No fabricated balances, signals,
 * pairs, strategies, or success rates. Live values come from homeService APIs.
 */
export function getHomeMockContent(): HomePageContent {
  return {
    header: {
      title: t('home.header.title'),
      subtitle: t('home.header.subtitle'),
    },
    botEngine: {
      name: t('home.bot.name'),
      iconSrc: brandAssets.botSetupLogo,
      statusLabel: t('home.bot.statusManual'),
      statusTone: 'neutral',
      stats: [
        { id: 'signal', label: t('home.stat.signal'), value: t('common.none') },
        { id: 'strength', label: t('common.rsi'), value: '—' },
        { id: 'updated', label: t('home.stat.candle'), value: '—' },
      ],
    },
    stats: [
      { id: 'balance', label: t('home.stat.balance'), value: '—' },
      { id: 'today-gain', label: t('home.stat.todayGain'), value: '—' },
      { id: 'today-loss', label: t('home.stat.todayLoss'), value: '—' },
      { id: 'net', label: t('home.stat.net'), value: '—' },
      { id: 'active', label: t('home.stat.active'), value: '—' },
      { id: 'win-rate', label: t('home.stat.winRate'), value: '—' },
    ],
    controls: ['start', 'pause', 'stop', 'apply'],
    configRows: [
      {
        id: 'market-type',
        iconSrc: uiAssets.homeMarketType,
        label: t('home.row.marketType'),
        value: t('home.market.binolla'),
        sheetTarget: 'marketType',
      },
      {
        id: 'trading-pair',
        iconSrc: uiAssets.homeTradingPair,
        label: t('home.row.tradingPair'),
        value: '—',
        sheetTarget: 'tradingPair',
      },
      {
        id: 'indicator',
        iconSrc: uiAssets.homeTechnicalIndicator,
        label: t('home.row.indicator'),
        value: t('common.rsi'),
        sheetTarget: 'technicalIndicator',
      },
      {
        id: 'strategy',
        iconSrc: uiAssets.homeStrategy,
        label: t('home.row.strategy'),
        value: '—',
        sheetTarget: 'strategy',
      },
    ],
    tradeAmount: {
      label: t('home.tradeAmountSoon'),
      selectedId: '',
      displayValue: '—',
      options: [],
    },
    duration: {
      label: t('home.durationSoon'),
      selectedId: '',
      displayValue: '—',
      options: [],
    },
    riskLimits: [
      {
        id: 'profit-target',
        iconSrc: notificationAssets.profitTarget,
        label: t('home.risk.profitTarget'),
        value: '—',
        hint: t('home.risk.hintSoon'),
        valueTone: 'profit',
      },
      {
        id: 'loss-limit',
        iconSrc: notificationAssets.lossLimit,
        label: t('home.risk.lossLimit'),
        value: '—',
        hint: t('home.risk.hintSoon'),
        valueTone: 'loss',
      },
    ],
    actions: [
      { id: 'show-chart', label: t('home.action.showChart'), sheetTarget: 'chart' },
      { id: 'bot-settings', label: t('home.action.botSettings'), sheetTarget: 'settings' },
    ],
    disclaimer: t('home.disclaimer.default'),
    sheets: {
      chart: {
        titleTemplate: t('home.sheet.chartTitle'),
        candleData: [],
        stats: [
          { id: 'indicator', label: t('trading.indicator'), value: t('common.rsi') },
          { id: 'strategy', label: t('trading.strategy'), value: '—' },
          { id: 'signal', label: t('home.stat.signal'), value: t('common.none') },
        ],
      },
      settings: {
        title: t('home.sheet.settings'),
        toggles: [
          {
            id: 'auto-profit',
            label: t('home.settings.autoProfit'),
            enabled: false,
          },
          {
            id: 'auto-loss',
            label: t('home.settings.autoLoss'),
            enabled: false,
          },
          {
            id: 'signal-confirm',
            label: t('home.settings.signalConfirm'),
            enabled: false,
          },
          {
            id: 'notifications',
            label: t('home.settings.notifications'),
            enabled: true,
          },
        ],
        riskLabel: t('home.settings.riskLabel'),
        riskOptions: [
          { id: 'risk-low', label: t('common.low') },
          { id: RISK_MEDIUM_ID, label: t('common.medium') },
          { id: 'risk-high', label: t('common.high') },
        ],
        selectedRiskId: RISK_MEDIUM_ID,
        saveLabel: t('home.settings.save'),
      },
      marketType: {
        title: t('home.sheet.marketType'),
        selectedId: MARKET_BINOLLA_ID,
        options: [
          {
            id: MARKET_BINOLLA_ID,
            title: t('home.market.binolla'),
            description: t('home.market.binollaDesc'),
          },
        ],
      },
      tradingPair: {
        title: t('home.sheet.tradingPair'),
        searchPlaceholder: t('home.sheet.searchPairs'),
        emptySearchMessage: t('home.sheet.noPairs'),
        selectedId: '',
        options: [],
      },
      technicalIndicator: {
        title: t('home.sheet.indicator'),
        selectedId: INDICATOR_RSI_ID,
        options: [
          {
            id: INDICATOR_RSI_ID,
            title: t('home.indicator.rsi'),
            description: t('home.indicator.rsiDesc'),
            bestFor: t('home.indicator.rsiBest'),
            complexity: 'low',
            previewSrc: imageAssets.indicators.rsi,
          },
        ],
      },
      strategy: {
        title: t('home.sheet.strategy'),
        selectedId: '',
        options: [],
      },
    },
  };
}

function buildHomeInitialRuntime(): HomeRuntimeState {
  const settings = getHomeMockContent().sheets.settings;
  return {
    botStatus: 'stopped',
    marketTypeId: MARKET_BINOLLA_ID,
    tradingPairId: '',
    technicalIndicatorId: INDICATOR_RSI_ID,
    strategyId: 'rsi',
    tradeAmountId: '',
    durationId: '',
    settings: {
      ...settings,
      toggles: settings.toggles.map((toggle) => ({ ...toggle })),
      riskOptions: [...settings.riskOptions],
    },
  };
}

export const HOME_INITIAL_RUNTIME: HomeRuntimeState = buildHomeInitialRuntime();

export function getHomeSheetTitles() {
  return {
    settings: t('home.sheet.settings'),
    marketType: t('home.sheet.marketType'),
    tradingPair: t('home.sheet.tradingPair'),
    technicalIndicator: t('home.sheet.indicator'),
    strategy: t('home.sheet.strategy'),
  } as const;
}

export function getBotStatusDisplay(): Record<
  HomeRuntimeState['botStatus'],
  { label: string; tone: ChipTone }
> {
  return {
    // Start only enables RSI monitoring — it never places Binolla orders automatically.
    running: { label: t('home.bot.statusRsi'), tone: 'active' },
    paused: { label: t('home.bot.statusPaused'), tone: 'warning' },
    stopped: { label: t('home.bot.statusManual'), tone: 'neutral' },
  };
}

export function getComplexityDisplay(): Record<'low' | 'medium', { label: string; tone: ChipTone }> {
  return {
    low: { label: t('common.low'), tone: 'success' },
    medium: { label: t('common.medium'), tone: 'warning' },
  };
}
