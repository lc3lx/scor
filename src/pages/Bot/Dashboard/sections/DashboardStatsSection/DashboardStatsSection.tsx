import { Text } from '@components/atoms/Text';
import type { DashboardStatCard } from '../../types';
import styles from './DashboardStatsSection.module.css';

export type DashboardStatsSectionProps = {
  stats: DashboardStatCard[];
};

export function DashboardStatsSection({ stats }: DashboardStatsSectionProps) {
  return (
    <section className={styles.grid} aria-label="Dashboard statistics">
      {stats.map((stat) => (
        <article key={stat.id} className={styles.card}>
          <Text variant="caption" tone="primary" className={styles.label}>
            {stat.label}
          </Text>
          <Text variant="h3" tone={stat.valueTone} className={styles.value}>
            {stat.value}
          </Text>
          <Text variant="caption-xs" className={styles.secondary}>
            {stat.secondary}
          </Text>
        </article>
      ))}
    </section>
  );
}
