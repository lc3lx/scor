import { Chip } from '@components/atoms/Chip';
import { Text } from '@components/atoms/Text';
import type { ChipTone } from '@components/types';
import { cn } from '@utils/cn';
import styles from './IndicatorOptionCard.module.css';

export type IndicatorOptionCardProps = {
  title: string;
  description: string;
  bestFor: string;
  complexityLabel: string;
  complexityTone: ChipTone;
  previewSrc: string;
  selected?: boolean;
  onSelect?: () => void;
  className?: string;
};

export function IndicatorOptionCard({
  title,
  description,
  bestFor,
  complexityLabel,
  complexityTone,
  previewSrc,
  selected = false,
  onSelect,
  className,
}: IndicatorOptionCardProps) {
  return (
    <article className={cn(styles.card, className)}>
      <div className={styles.body}>
        <Text variant="body-sm" tone="body" className={styles.title}>
          {title}
        </Text>
        <Text variant="caption" tone="muted" className={styles.description}>
          {description}
        </Text>
        <Text variant="caption-xs" tone="caption" className={styles.bestFor}>
          {bestFor}
        </Text>
        <div className={styles.footer}>
          <button type="button" className={styles.action} onClick={onSelect}>
            {selected ? 'Selected ✓' : 'Select →'}
          </button>
          <Chip label={complexityLabel} tone={complexityTone} style="outlined" className={styles.badge} />
        </div>
      </div>
      <div className={styles.previewWrap} aria-hidden="true">
        <img src={previewSrc} alt="" className={styles.preview} />
      </div>
    </article>
  );
}
