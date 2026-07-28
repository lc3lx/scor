import { uiAssets } from '@assets/index';
import { Button } from '@components/atoms/Button';
import { Icon } from '@components/atoms/Icon';
import { ProgressBar } from '@components/molecules';
import { cn } from '@utils/cn';
import type { OnboardingFooterVariant } from '../types';
import styles from './OnboardingFooter.module.css';

export type OnboardingFooterProps = {
  currentStep: number;
  totalSteps: number;
  variant: OnboardingFooterVariant;
  onNext: () => void;
  onBack: () => void;
  onComplete: () => void;
  className?: string;
};

export function OnboardingFooter({
  currentStep,
  totalSteps,
  variant,
  onNext,
  onBack,
  onComplete,
  className,
}: OnboardingFooterProps) {
  const usesNavPadding = variant === 'nav' || variant === 'get-started';

  return (
    <footer className={cn(styles.footer, usesNavPadding && styles.footerNav, className)}>
      <ProgressBar totalSteps={totalSteps} currentStep={currentStep} />

      {variant === 'next-full' && (
        <Button variant="primary" fullWidth onClick={onNext} className={styles.nextButton}>
          Next
          <Icon src={uiAssets.nextChevron} decorative className={styles.nextChevron} />
        </Button>
      )}

      {variant === 'nav' && (
        <div className={styles.navRow}>
          <Button variant="ghost" onClick={onBack} className={styles.backButton}>
            <Icon src={uiAssets.backChevron} decorative className={styles.backChevron} />
            Back
          </Button>
          <Button variant="primary" onClick={onNext} className={styles.nextButtonCompact}>
            Next
            <Icon src={uiAssets.nextChevron} decorative className={styles.nextChevron} />
          </Button>
        </div>
      )}

      {variant === 'get-started' && (
        <Button variant="primary" fullWidth onClick={onComplete} className={styles.getStartedButton}>
          Get Started
        </Button>
      )}
    </footer>
  );
}
