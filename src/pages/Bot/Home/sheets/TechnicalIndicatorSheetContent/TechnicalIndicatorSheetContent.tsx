import { IndicatorOptionCard } from '@components/molecules/IndicatorOptionCard';
import { COMPLEXITY_DISPLAY } from '../../data/home.mock';
import type { TechnicalIndicatorSheetContent } from '../../types';
import styles from './TechnicalIndicatorSheetContent.module.css';

export type TechnicalIndicatorSheetContentProps = {
  content: TechnicalIndicatorSheetContent;
  onSelect: (optionId: string) => void;
};

export function TechnicalIndicatorSheetContent({
  content,
  onSelect,
}: TechnicalIndicatorSheetContentProps) {
  return (
    <div className={styles.root}>
      {content.options.map((option) => {
        const complexity = COMPLEXITY_DISPLAY[option.complexity];

        return (
          <IndicatorOptionCard
            key={option.id}
            title={option.title}
            description={option.description}
            bestFor={option.bestFor}
            complexityLabel={complexity.label}
            complexityTone={complexity.tone}
            previewSrc={option.previewSrc}
            selected={option.id === content.selectedId}
            onSelect={() => onSelect(option.id)}
          />
        );
      })}
    </div>
  );
}
