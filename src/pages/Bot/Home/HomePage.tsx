import { useCallback, useMemo, useState } from 'react';
import { PageContent } from '@components/layouts/PageContent';
import { BottomSheet } from '@components/organisms/BottomSheet';
import { HOME_SHEET_TITLES, BOT_STATUS_DISPLAY } from './data/home.mock';
import { resolveChartSheetTitle } from './utils/chartTitle';
import { useHomeBotControls } from './hooks/useHomeBotControls';
import { useHomeData } from './hooks/useHomeData';
import { useHomeSheets } from './hooks/useHomeSheets';
import { BotControlsSection } from './sections/BotControlsSection';
import { BotEngineSection } from './sections/BotEngineSection';
import { DurationSection } from './sections/DurationSection';
import { HomeActionsSection } from './sections/HomeActionsSection';
import { HomeConfigSection } from './sections/HomeConfigSection';
import { HomeDisclaimerSection } from './sections/HomeDisclaimerSection';
import { HomeHeaderSection } from './sections/HomeHeaderSection';
import { HomeStatsSection } from './sections/HomeStatsSection';
import { RiskLimitsSection } from './sections/RiskLimitsSection';
import { TradeAmountSection } from './sections/TradeAmountSection';
import { BotSettingsSheetContent } from './sheets/BotSettingsSheetContent';
import { ChartSheetContent } from './sheets/ChartSheetContent';
import { MarketTypeSheetContent } from './sheets/MarketTypeSheetContent';
import { StrategySheetContent } from './sheets/StrategySheetContent';
import { TechnicalIndicatorSheetContent } from './sheets/TechnicalIndicatorSheetContent';
import { TradingPairSheetContent } from './sheets/TradingPairSheetContent';
import styles from './HomePage.module.css';

export default function HomePage() {
  const homeData = useHomeData();
  const sheets = useHomeSheets();
  const botControls = useHomeBotControls(homeData);
  const [pairSearchQuery, setPairSearchQuery] = useState('');

  const { data, configRows, tradeAmount, duration, updateRuntime } = homeData;

  const botEngine = useMemo(() => {
    if (!data) return null;

    const status = BOT_STATUS_DISPLAY[data.runtime.botStatus];

    return {
      ...data.botEngine,
      statusLabel: status.label,
      statusTone: status.tone,
    };
  }, [data]);

  const settingsContent = data?.runtime.settings ?? data?.sheets.settings;

  const marketTypeContent = useMemo(() => {
    if (!data) return null;

    return {
      ...data.sheets.marketType,
      selectedId: data.runtime.marketTypeId,
    };
  }, [data]);

  const tradingPairContent = useMemo(() => {
    if (!data) return null;

    return {
      ...data.sheets.tradingPair,
      selectedId: data.runtime.tradingPairId,
    };
  }, [data]);

  const technicalIndicatorContent = useMemo(() => {
    if (!data) return null;

    return {
      ...data.sheets.technicalIndicator,
      selectedId: data.runtime.technicalIndicatorId,
    };
  }, [data]);

  const strategyContent = useMemo(() => {
    if (!data) return null;

    return {
      ...data.sheets.strategy,
      selectedId: data.runtime.strategyId,
    };
  }, [data]);

  const filteredPairOptions = useMemo(() => {
    if (!tradingPairContent) return [];

    const query = pairSearchQuery.trim().toLowerCase();
    if (!query) return tradingPairContent.options;

    return tradingPairContent.options.filter(
      (option) =>
        option.title.toLowerCase().includes(query) ||
        option.description?.toLowerCase().includes(query),
    );
  }, [pairSearchQuery, tradingPairContent]);

  const chartTitle = useMemo(() => {
    if (!data || !duration || !tradingPairContent) return '';

    const pairLabel =
      tradingPairContent.options.find((option) => option.id === tradingPairContent.selectedId)
        ?.title ?? '';

    return resolveChartSheetTitle({
      template: data.sheets.chart.titleTemplate,
      pairLabel,
      durationLabel: duration.displayValue,
    });
  }, [data, duration, tradingPairContent]);

  const handleMarketTypeSelect = useCallback(
    async (optionId: string) => {
      await updateRuntime({ marketTypeId: optionId });
      sheets.closeSheet();
    },
    [sheets.closeSheet, updateRuntime],
  );

  const handleTradingPairSelect = useCallback(
    async (optionId: string) => {
      await updateRuntime({ tradingPairId: optionId });
      setPairSearchQuery('');
      sheets.closeSheet();
    },
    [sheets.closeSheet, updateRuntime],
  );

  const handleTechnicalIndicatorSelect = useCallback(
    async (optionId: string) => {
      await updateRuntime({ technicalIndicatorId: optionId });
      sheets.closeSheet();
    },
    [sheets.closeSheet, updateRuntime],
  );

  const handleStrategySelect = useCallback(
    async (optionId: string) => {
      await updateRuntime({ strategyId: optionId });
      sheets.closeSheet();
    },
    [sheets.closeSheet, updateRuntime],
  );

  const handleSettingsToggle = useCallback(
    async (toggleId: string, enabled: boolean) => {
      if (!settingsContent) return;

      await updateRuntime({
        settings: {
          ...settingsContent,
          toggles: settingsContent.toggles.map((toggle) =>
            toggle.id === toggleId ? { ...toggle, enabled } : toggle,
          ),
        },
      });
    },
    [settingsContent, updateRuntime],
  );

  const handleRiskSelect = useCallback(
    async (riskId: string) => {
      if (!settingsContent) return;

      await updateRuntime({
        settings: {
          ...settingsContent,
          selectedRiskId: riskId,
        },
      });
    },
    [settingsContent, updateRuntime],
  );

  const handleSettingsSave = useCallback(() => {
    sheets.closeSheet();
  }, [sheets.closeSheet]);

  if (
    !data ||
    !botEngine ||
    !tradeAmount ||
    !duration ||
    !marketTypeContent ||
    !tradingPairContent ||
    !technicalIndicatorContent ||
    !strategyContent ||
    !settingsContent
  ) {
    return null;
  }

  return (
    <>
      <main className={styles.page} aria-label="AI Bot Engine">
        <div className={styles.scroll}>
          <PageContent className={styles.content}>
            <HomeHeaderSection content={data.header} />
            <BotEngineSection content={botEngine} />
            <HomeStatsSection stats={data.stats} />
            <BotControlsSection
              controls={data.controls}
              isStartPressed={botControls.isStartPressed}
              onStart={botControls.handleStart}
              onPause={botControls.handlePause}
              onStop={botControls.handleStop}
              onApply={botControls.handleApply}
            />
            <HomeConfigSection rows={configRows} onRowClick={sheets.openSheet} />
            <TradeAmountSection
              content={tradeAmount}
              onSelect={(optionId) => updateRuntime({ tradeAmountId: optionId })}
            />
            <DurationSection
              content={duration}
              onSelect={(optionId) => updateRuntime({ durationId: optionId })}
            />
            <RiskLimitsSection limits={data.riskLimits} />
            <HomeActionsSection actions={data.actions} onAction={sheets.openSheet} />
            <HomeDisclaimerSection text={data.disclaimer} />
          </PageContent>
        </div>
      </main>

      <BottomSheet
        open={sheets.activeSheet === 'chart'}
        title={chartTitle}
        onClose={sheets.closeSheet}
      >
        <ChartSheetContent content={data.sheets.chart} />
      </BottomSheet>

      <BottomSheet
        open={sheets.activeSheet === 'settings'}
        title={HOME_SHEET_TITLES.settings}
        onClose={sheets.closeSheet}
      >
        <BotSettingsSheetContent
          content={settingsContent}
          onToggleChange={handleSettingsToggle}
          onRiskSelect={handleRiskSelect}
          onSave={handleSettingsSave}
        />
      </BottomSheet>

      <BottomSheet
        open={sheets.activeSheet === 'marketType'}
        title={HOME_SHEET_TITLES.marketType}
        onClose={sheets.closeSheet}
      >
        <MarketTypeSheetContent content={marketTypeContent} onSelect={handleMarketTypeSelect} />
      </BottomSheet>

      <BottomSheet
        open={sheets.activeSheet === 'tradingPair'}
        title={HOME_SHEET_TITLES.tradingPair}
        onClose={sheets.closeSheet}
      >
        <TradingPairSheetContent
          content={tradingPairContent}
          searchQuery={pairSearchQuery}
          onSearchChange={setPairSearchQuery}
          filteredOptions={filteredPairOptions}
          onSelect={handleTradingPairSelect}
        />
      </BottomSheet>

      <BottomSheet
        open={sheets.activeSheet === 'technicalIndicator'}
        title={HOME_SHEET_TITLES.technicalIndicator}
        onClose={sheets.closeSheet}
      >
        <TechnicalIndicatorSheetContent
          content={technicalIndicatorContent}
          onSelect={handleTechnicalIndicatorSelect}
        />
      </BottomSheet>

      <BottomSheet
        open={sheets.activeSheet === 'strategy'}
        title={HOME_SHEET_TITLES.strategy}
        onClose={sheets.closeSheet}
      >
        <StrategySheetContent content={strategyContent} onSelect={handleStrategySelect} />
      </BottomSheet>
    </>
  );
}
