import { BackgroundGlow } from '@components/organisms/BackgroundGlow';
import { PageContent } from '@components/layouts/PageContent';
import { cn } from '@utils/cn';
import { OnboardingFooter } from './components/OnboardingFooter';
import { ONBOARDING_MOCK_CONTENT } from './data/onboarding.mock';
import { useOnboardingFlow } from './hooks/useOnboardingFlow';
import { OnboardingStepOne } from './sections/OnboardingStepOne';
import { OnboardingStepTwo } from './sections/OnboardingStepTwo';
import { OnboardingStepThree } from './sections/OnboardingStepThree';
import styles from './OnboardingPage.module.css';

export default function OnboardingPage() {
  const flow = useOnboardingFlow();
  const { step1, step2, step3 } = ONBOARDING_MOCK_CONTENT;

  const bodyClassName = cn(
    styles.body,
    flow.bodyVariant === 'step-two' && styles.bodyStepTwo,
    flow.bodyVariant === 'step-three' && styles.bodyStepThree,
  );

  return (
    <main className={styles.page} aria-label="Onboarding">
      <BackgroundGlow variant="top-right" />

      <header className={styles.header}>
        <div className={styles.skipRow}>
          <button type="button" className={styles.skipButton} onClick={flow.skip}>
            <span className={styles.skipLabel}>sKIP</span>
          </button>
        </div>
      </header>

      <div className={bodyClassName}>
        <PageContent>
          {flow.currentStep === 1 && <OnboardingStepOne content={step1} />}
          {flow.currentStep === 2 && <OnboardingStepTwo content={step2} />}
          {flow.currentStep === 3 && <OnboardingStepThree content={step3} />}
        </PageContent>
      </div>

      <OnboardingFooter
        currentStep={flow.currentStep}
        totalSteps={flow.totalSteps}
        variant={flow.footerVariant}
        onNext={flow.goNext}
        onBack={flow.goBack}
        onComplete={flow.complete}
      />
    </main>
  );
}
