import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageContent } from '@components/layouts/PageContent';
import { getTradeDetailPath } from '@constants/routes';
import type { TradeListFilter } from '@services/trades';
import { useTradeHistory } from './hooks/useTradeHistory';
import { HistoryFiltersSection } from './sections/HistoryFiltersSection';
import { HistoryHeaderSection } from './sections/HistoryHeaderSection';
import { HistoryListSection } from './sections/HistoryListSection';
import styles from './HistoryPage.module.css';

export default function HistoryPage() {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState<TradeListFilter>('all');
  const { trades, isEmpty, isLoading } = useTradeHistory(activeFilter);

  const handleTradeSelect = useCallback(
    (tradeId: string) => {
      navigate(getTradeDetailPath(tradeId));
    },
    [navigate],
  );

  if (isLoading) return null;

  return (
    <main className={styles.page} aria-label="Trade history">
      <div className={styles.scroll}>
        <PageContent className={styles.content}>
          <div className={styles.stickyHeader}>
            <HistoryHeaderSection />
            <HistoryFiltersSection activeFilter={activeFilter} onFilterChange={setActiveFilter} />
          </div>
          <HistoryListSection
            trades={trades}
            isEmpty={isEmpty}
            activeFilter={activeFilter}
            onTradeSelect={handleTradeSelect}
          />
        </PageContent>
      </div>
    </main>
  );
}
