import { SecurityNotice } from '@components/molecules';
import {
  AuthBrand,
  AuthHero,
  AuthLegalFooter,
  AuthShell,
} from '@features/Auth';
import { LOGIN_COPY } from './data/login.mock';
import { useLoginForm } from './hooks/useLoginForm';
import { LoginFormSection } from './sections/LoginFormSection';
import styles from './LoginPage.module.css';

export default function LoginPage() {
  const form = useLoginForm();
  const copy = LOGIN_COPY;

  return (
    <AuthShell
      ariaLabel="Login"
      glows={['top-right', 'bottom']}
      bodyClassName={styles.body}
      footer={
        <AuthLegalFooter
          prefix={copy.footerPrefix}
          linkLabel={copy.footerLinkLabel}
          suffix={copy.footerSuffix}
          href={copy.footerHref}
        />
      }
    >
      <div className={styles.brandSection}>
        <AuthBrand />
      </div>

      <div className={styles.heroSection}>
        <AuthHero title={copy.title} description={copy.description} inset />
      </div>

      <LoginFormSection
        copy={copy}
        email={form.values.email}
        password={form.values.password}
        emailError={form.fieldErrors.email}
        passwordError={form.fieldErrors.password}
        serverError={form.serverError}
        status={form.status}
        isSubmitDisabled={form.isSubmitDisabled}
        onEmailChange={(value) => form.setField('email', value)}
        onPasswordChange={(value) => form.setField('password', value)}
        onForgotPassword={form.onForgotPassword}
        onCreateAccount={form.goToSignup}
        onSubmit={form.submit}
      />

      <div className={styles.securitySection}>
        <SecurityNotice title={copy.securityTitle} subtitle={copy.securitySubtitle} />
      </div>
    </AuthShell>
  );
}
