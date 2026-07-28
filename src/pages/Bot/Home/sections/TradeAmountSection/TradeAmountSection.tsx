import { OptionChip } from '@components/molecules/OptionChip';
import { Text } from '@components/atoms/Text';
import type { ChipGroupContent } from '../../types';
import styles from './TradeAmountSection.module.css';

export type TradeAmountSectionProps = {
  content: ChipGroupContent;
  onSelect: (optionId: string) => void;
};

export function TradeAmountSection({ content, onSelect }: TradeAmountSectionProps) {
  return (
    <section className={styles.section} aria-label={content.label}>
      <div className={styles.card}>
        <Text variant="caption" tone="muted" className={styles.label}>
          {content.label}
        </Text>
        <Text variant="h2" tone="body" className={styles.value}>
          {content.displayValue}
        </Text>
        <div className={styles.chips}>
          {content.options.map((option) => (
            <OptionChip
              key={option.id}
              label={option.label}
              selected={option.id === content.selectedId}
              onSelect={() => onSelect(option.id)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
