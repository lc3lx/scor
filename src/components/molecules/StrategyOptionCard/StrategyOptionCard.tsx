import { Chip } from '@components/atoms/Chip';
import { Text } from '@components/atoms/Text';
import { cn } from '@utils/cn';
import styles from './StrategyOptionCard.module.css';

export type StrategyStatItem = {
  label: string;
  value: string;
};

export type StrategyOptionCardProps = {
  title: string;
  stats: StrategyStatItem[];
  successRate: string;
  previewSrc: string;
  selected?: boolean;
  onSelect?: () => void;
  className?: string;
};

export function StrategyOptionCard({
  title,
  stats,
  successRate,
  previewSrc,
  selected = false,
  onSelect,
  className,
}: StrategyOptionCardProps) {
  return (
    <article className={cn(styles.card, className)}>
      <div className={styles.body}>
        <Text variant="body-sm" tone="body" className={styles.title}>
          {title}
        </Text>
        <dl className={styles.statsGrid}>
          {stats.map((stat) => (
            <div key={stat.label} className={styles.statItem}>
              <dt className={styles.statLabel}>{stat.label}:</dt>
              <dd className={styles.statValue}>{stat.value}</dd>
            </div>
          ))}
        </dl>
        <div className={styles.footer}>
          <button type="button" className={styles.action} onClick={onSelect}>
            {selected ? 'Selected ✓' : 'Select →'}
          </button>
          <Chip label={successRate} tone="success" style="outlined" className={styles.badge} />
        </div>
      </div>
      <div className={styles.previewWrap} aria-hidden="true">
        <img src={previewSrc} alt="" className={styles.preview} />
      </div>
    </article>
  );
}
