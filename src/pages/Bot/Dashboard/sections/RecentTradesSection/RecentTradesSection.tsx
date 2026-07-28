import { Text } from '@components/atoms/Text';
import type { DashboardMarketRow } from '../../types';
import styles from './RecentTradesSection.module.css';

export type RecentTradesSectionProps = {
  markets: DashboardMarketRow[];
};

export function RecentTradesSection({ markets }: RecentTradesSectionProps) {
  return (
    <section className={styles.list} aria-label="Recent market activity">
      {markets.map((row) => (
        <article key={row.id} className={styles.row}>
          <span className={styles.abbr} aria-hidden="true">
            {row.abbr}
          </span>
          <div className={styles.copy}>
            <Text variant="body-sm" tone="primary" className={styles.pair}>
              {row.pair}
            </Text>
            <Text variant="caption-xs" className={styles.subtitle}>
              {row.subtitle}
            </Text>
          </div>
          <div className={styles.meta}>
            <Text variant="body-sm" tone={row.resultTone} className={styles.result}>
              {row.result}
            </Text>
            <Text variant="caption-xs" className={styles.stake}>
              {row.stake}
            </Text>
          </div>
        </article>
      ))}
    </section>
  );
}
