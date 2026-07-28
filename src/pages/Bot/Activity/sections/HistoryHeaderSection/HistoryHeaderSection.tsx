import { tradeAssets } from '@assets/index';
import { Button } from '@components/atoms/Button';
import { Icon } from '@components/atoms/Icon';
import { Text } from '@components/atoms/Text';
import { tradeService } from '@services/trades';
import styles from './HistoryHeaderSection.module.css';

export type HistoryHeaderSectionProps = {
  onFilterClick?: () => void;
};

export function HistoryHeaderSection({ onFilterClick }: HistoryHeaderSectionProps) {
  const content = tradeService.getHistoryPageContent();

  return (
    <section className={styles.section} aria-label="Trades header">
      <Text variant="h1" tone="body" className={styles.title}>
        {content.title}
      </Text>
      <Button
        variant="icon"
        className={styles.filterButton}
        aria-label={content.filterAriaLabel}
        onClick={onFilterClick}
      >
        <Icon src={tradeAssets.filter} size="sm" decorative />
      </Button>
    </section>
  );
}
