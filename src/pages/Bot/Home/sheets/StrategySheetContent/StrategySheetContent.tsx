import { StrategyOptionCard } from '@components/molecules/StrategyOptionCard';
import type { StrategySheetContent } from '../../types';
import styles from './StrategySheetContent.module.css';

export type StrategySheetContentProps = {
  content: StrategySheetContent;
  onSelect: (optionId: string) => void;
};

export function StrategySheetContent({ content, onSelect }: StrategySheetContentProps) {
  return (
    <div className={styles.root}>
      {content.options.map((option) => (
        <StrategyOptionCard
          key={option.id}
          title={option.title}
          stats={option.stats}
          successRate={option.successRate}
          previewSrc={option.previewSrc}
          selected={option.id === content.selectedId}
          onSelect={() => onSelect(option.id)}
        />
      ))}
    </div>
  );
}
