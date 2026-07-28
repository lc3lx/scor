import { AppLinkTiles, KeyPoint, TradingPreviewCard } from '@components/molecules';
import { Text } from '@components/atoms/Text';
import type { OnboardingStepOneContent } from '../../types';
import styles from './OnboardingStepOne.module.css';

export type OnboardingStepOneProps = {
  content: OnboardingStepOneContent;
};

export function OnboardingStepOne({ content }: OnboardingStepOneProps) {
  return (
    <section className={styles.step} aria-label="Onboarding step 1">
      <Text as="h1" variant="display" tone="primary" align="center" className={styles.title}>
        {content.title}
      </Text>

      <Text variant="body" tone="onboarding" align="center" className={styles.description}>
        {content.description}
      </Text>

      <div className={styles.tilesSection}>
        <AppLinkTiles />
      </div>

      <div className={styles.cardSection}>
        <TradingPreviewCard />
      </div>

      <ul className={styles.keyPoints}>
        {content.keyPoints.map((point) => (
          <li key={point.id}>
            <KeyPoint text={point.text} variant={point.variant} />
          </li>
        ))}
      </ul>

      <Text variant="caption-xs" tone="disclaimer" align="center" className={styles.footnote}>
        {content.footnote}
      </Text>
    </section>
  );
}
