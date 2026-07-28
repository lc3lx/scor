import { CandlestickChart } from '@components/organisms/CandlestickChart';
import { Text } from '@components/atoms/Text';
import type { ChartSheetContent } from '../../types';
import styles from './ChartSheetContent.module.css';

export type ChartSheetContentProps = {
  content: ChartSheetContent;
};

export function ChartSheetContent({ content }: ChartSheetContentProps) {
  return (
    <div className={styles.root}>
      <div className={styles.chartWrap}>
        <CandlestickChart data={content.candleData} />
      </div>
      <div className={styles.stats}>
        {content.stats.map((stat) => (
          <div key={stat.id} className={styles.statBox}>
            <Text variant="caption-xs" tone="muted" className={styles.statLabel}>
              {stat.label}
            </Text>
            <Text variant="body-sm" tone={stat.valueTone ?? 'body'} className={styles.statValue}>
              {stat.value}
            </Text>
          </div>
        ))}
      </div>
    </div>
  );
}
