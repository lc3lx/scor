import { dashboardAssets } from '@assets/index';
import { Text } from '@components/atoms/Text';
import { cn } from '@utils/cn';
import type { DashboardPerformance, DashboardTimeframe } from '../../types';
import styles from './PerformanceSection.module.css';

export type PerformanceSectionProps = {
  performance: DashboardPerformance;
  activeTimeframe: DashboardTimeframe;
  onTimeframeChange: (timeframe: DashboardTimeframe) => void;
};

export function PerformanceSection({
  performance,
  activeTimeframe,
  onTimeframeChange,
}: PerformanceSectionProps) {
  return (
    <section className={styles.card} aria-label={performance.label}>
      <div className={styles.top}>
        <div className={styles.copy}>
          <Text variant="caption" tone="primary" className={styles.label}>
            {performance.label}
          </Text>
          <Text variant="h3" tone="success" className={styles.value}>
            {performance.value}
          </Text>
        </div>

        <div className={styles.tabs} role="tablist" aria-label="Performance timeframe">
          {performance.timeframes.map((tab) => {
            const active = tab.id === activeTimeframe;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={active}
                className={cn(styles.tab, active && styles.tabActive)}
                onClick={() => onTimeframeChange(tab.id)}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      <img
        src={dashboardAssets.performanceChart}
        alt=""
        className={styles.chart}
        hidden={performance.value === '—'}
      />

      {performance.value === '—' ? (
        <Text variant="caption" tone="caption" className={styles.day}>
          No local chart — P/L comes from Binolla trades only.
        </Text>
      ) : null}

      <div className={styles.days}>
        {performance.value === '—'
          ? null
          : performance.dayLabels.map((day) => (
              <Text key={day} variant="caption-xs" className={styles.day}>
                {day}
              </Text>
            ))}
      </div>
    </section>
  );
}
