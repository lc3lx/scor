import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageContent } from '@components/layouts/PageContent';
import { BackgroundGlow } from '@components/organisms/BackgroundGlow';
import { getTradeDetailPath, ROUTES } from '@constants/routes';
import { useT } from '@shared/i18n';
import { useTradingData } from './hooks/useTradingData';
import { BinollaTradingCardSection } from './sections/BinollaTradingCardSection';
import { ScarAlphaSignalCardSection } from './sections/ScarAlphaSignalCardSection';
import { TradingTopBarSection } from './sections/TradingTopBarSection';
import styles from './TradingPage.module.css';

export default function TradingPage() {
  const t = useT();
  const navigate = useNavigate();
  const { data, duration, expiryDisplay, updateRuntime, cycleTradeDuration, selectCandlePeriod, selectPair, placeTrade, reload } =
    useTradingData();

  const handleTrade = useCallback(
    async (direction: 'up' | 'down') => {
      try {
        const tradeId = await placeTrade(direction);
        navigate(getTradeDetailPath(tradeId));
      } catch (error) {
        const message =
          error && typeof error === 'object' && 'message' in error
            ? String((error as { message: unknown }).message)
            : t('trading.tradeFailed');
        window.alert(message);
      }
    },
    [navigate, placeTrade, t],
  );

  if (!data || !duration) {
    return (
      <main className={styles.page} aria-label={t('trading.aria')} aria-busy="true">
        <div className={styles.scroll}>
          <BackgroundGlow variant="top-right" />
          <PageContent className={styles.content}>
            <p className={styles.loading}>{t('trading.loading')}</p>
          </PageContent>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.page} aria-label={t('trading.aria')}>
      <div className={styles.scroll}>
        <BackgroundGlow variant="top-right" />
        <PageContent className={styles.content}>
          <TradingTopBarSection content={data.topBar} onRefresh={() => void reload()} />
          <BinollaTradingCardSection
            content={data.binollaCard}
            amount={data.runtime.amount}
            durationLabel={duration.label}
            expiryDisplay={expiryDisplay}
            timeframeOptions={data.timeframeOptions}
            selectedTimeframeId={data.runtime.candlePeriodId}
            onAmountChange={(value) => updateRuntime({ amount: value })}
            onCycleDuration={() => void cycleTradeDuration()}
            onSelectTimeframe={(id) => void selectCandlePeriod(id)}
            onSelectPair={(symbol) => void selectPair(symbol)}
            onTradeUp={() => handleTrade('up')}
            onTradeDown={() => handleTrade('down')}
          />
          <ScarAlphaSignalCardSection
            content={data.signalCard}
            onOpenBot={() => navigate(ROUTES.bot)}
          />
        </PageContent>
      </div>
    </main>
  );
}
