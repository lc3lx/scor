import { AuthBrand, AuthHero, AuthShell } from '@features/Auth';
import { SIGNUP_COPY } from './data/signup.mock';
import { useSignupForm } from './hooks/useSignupForm';
import { SignupFormSection } from './sections/SignupFormSection';
import { SignupSignInPrompt } from './sections/SignupSignInPrompt';
import styles from './SignupPage.module.css';

export default function SignupPage() {
  const form = useSignupForm();
  const copy = SIGNUP_COPY;

  return (
    <AuthShell ariaLabel="Signup" glows={['top-right']} bodyClassName={styles.body}>
      <div className={styles.brandSection}>
        <AuthBrand />
      </div>

      <div className={styles.heroSection}>
        <AuthHero
          title={copy.title}
          description={copy.description}
          titleVariant="h2"
          descriptionTone="caption"
          descriptionClassName={styles.heroDescription}
        />
      </div>

      <div className={styles.formSection}>
        <SignupFormSection
          copy={copy}
          values={form.values}
          fieldErrors={form.fieldErrors}
          serverError={form.serverError}
          status={form.status}
          isSubmitDisabled={form.isSubmitDisabled}
          onFieldChange={form.setField}
          onSubmit={form.submit}
        />
      </div>

      <SignupSignInPrompt
        dividerLabel={copy.dividerLabel}
        promptLabel={copy.promptLabel}
        signInLabel={copy.signInLabel}
        onSignIn={form.goToLogin}
      />
    </AuthShell>
  );
}
