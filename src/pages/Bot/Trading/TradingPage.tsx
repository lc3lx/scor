import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageContent } from '@components/layouts/PageContent';
import { BackgroundGlow } from '@components/organisms/BackgroundGlow';
import { getTradeDetailPath, ROUTES } from '@constants/routes';
import { useTradingData } from './hooks/useTradingData';
import { BinollaTradingCardSection } from './sections/BinollaTradingCardSection';
import { ScarAlphaSignalCardSection } from './sections/ScarAlphaSignalCardSection';
import { TradingTopBarSection } from './sections/TradingTopBarSection';
import styles from './TradingPage.module.css';

export default function TradingPage() {
  const navigate = useNavigate();
  const { data, duration, expiryDisplay, updateRuntime, placeTrade, reload } = useTradingData();

  const handleTrade = useCallback(
    async (direction: 'up' | 'down') => {
      try {
        const tradeId = await placeTrade(direction);
        navigate(getTradeDetailPath(tradeId));
      } catch (error) {
        const message =
          error && typeof error === 'object' && 'message' in error
            ? String((error as { message: unknown }).message)
            : 'Trade failed.';
        window.alert(message);
      }
    },
    [navigate, placeTrade],
  );

  if (!data || !duration) return null;

  return (
    <main className={styles.page} aria-label="Trading">
      <div className={styles.scroll}>
        <BackgroundGlow variant="top-right" />
        <PageContent className={styles.content}>
          <TradingTopBarSection content={data.topBar} onRefresh={() => void reload()} />
          <BinollaTradingCardSection
            content={data.binollaCard}
            amount={data.runtime.amount}
            durationLabel={duration.label}
            expiryDisplay={expiryDisplay}
            onAmountChange={(value) => updateRuntime({ amount: value })}
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
