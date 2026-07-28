import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@components/atoms/Button';
import { Text } from '@components/atoms/Text';
import { PageContent } from '@components/layouts/PageContent';
import { ROUTES } from '@constants/routes';
import { useTradeDetail } from './hooks/useTradeDetail';
import {
  TradeDetailHeaderSection,
  TradeDetailHeroSection,
} from './sections/TradeDetailHeroSection';
import { TradeDetailsSection } from './sections/TradeDetailsSection';
import { TradeTimelineSection } from './sections/TradeTimelineSection';
import styles from './TradeDetailPage.module.css';

export default function TradeDetailPage() {
  const navigate = useNavigate();
  const { tradeId } = useParams<{ tradeId: string }>();
  const { detail, status } = useTradeDetail(tradeId);

  if (status === 'loading') return null;

  if (status === 'missing' || !detail) {
    return (
      <main className={styles.page} aria-label="Trade not found">
        <div className={styles.scroll}>
          <PageContent className={styles.content}>
            <TradeDetailHeaderSection
              title="Trade Details"
              statusLabel="Missing"
              statusTone="neutral"
              onBack={() => navigate(-1)}
            />
            <Text variant="body-sm" tone="caption" align="center">
              This trade could not be found.
            </Text>
            <Button variant="ghost" fullWidth onClick={() => navigate(ROUTES.history)}>
              Back to History
            </Button>
          </PageContent>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.page} aria-label={detail.pageTitle}>
      <div className={styles.scroll}>
        <PageContent className={styles.content}>
          <TradeDetailHeaderSection
            title={detail.pageTitle}
            statusLabel={detail.statusLabel}
            statusTone={detail.statusTone}
            onBack={() => navigate(-1)}
          />
          <TradeDetailHeroSection content={detail.hero} candleData={detail.candleData} />
          <TradeDetailsSection rows={detail.detailRows} />
          <TradeTimelineSection
            title={detail.timelineTitle}
            entries={detail.timeline}
            checkIconSrc={detail.timelineCheckIconSrc}
          />
        </PageContent>
      </div>
    </main>
  );
}
