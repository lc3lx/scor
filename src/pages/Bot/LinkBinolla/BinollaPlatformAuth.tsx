import { Input } from '@components/atoms/Input';
import { PasswordInput } from '@components/atoms/PasswordInput';
import { FormField } from '@components/molecules/FormField';
import { AuthBrand, AuthHero, AuthServerError, AuthShell } from '@features/Auth';
import { BINOLLA_REFERRAL_SIGNUP_URL } from '@constants/binolla';
import {
  useBinollaPlatformAuth,
  type BinollaAuthMode,
} from './hooks/useBinollaPlatformAuth';
import styles from './LinkBinollaPage.module.css';

export type BinollaPlatformAuthProps = {
  mode: BinollaAuthMode;
};

export function BinollaPlatformAuth({ mode }: BinollaPlatformAuthProps) {
  const flow = useBinollaPlatformAuth(mode);
  const isLogin = mode === 'login';

  return (
    <AuthShell
      ariaLabel={isLogin ? 'Binolla login' : 'Binolla signup'}
      glows={['top-right']}
      bodyClassName={styles.body}
    >
      <AuthBrand />

      <div className={styles.hero}>
        <AuthHero
          title={isLogin ? 'Log in to Binolla' : 'Sign up on Binolla'}
          description={
            isLogin
              ? "Enter your Binolla email and password. We authenticate through Binolla and connect the bot — no website paste needed."
              : 'Create a Binolla account with our partner referral. Email/password go to Binolla; Scar Alpha has no separate accounts.'
          }
          titleVariant="h2"
          descriptionTone="caption"
        />
      </div>

      <form
        className={styles.form}
        onSubmit={(event) => {
          event.preventDefault();
          void flow.submitCredentials();
        }}
        noValidate
      >
        <FormField id="binolla-email" label="Binolla email" error={undefined}>
          <Input
            id="binolla-email"
            type="email"
            name="email"
            autoComplete="username"
            placeholder="you@email.com"
            value={flow.email}
            onChange={(event) => flow.setEmail(event.target.value)}
          />
        </FormField>

        <FormField id="binolla-password" label="Binolla password" error={undefined}>
          <PasswordInput
            id="binolla-password"
            name="password"
            autoComplete={isLogin ? 'current-password' : 'new-password'}
            placeholder="••••••••"
            value={flow.password}
            onChange={(event) => flow.setPassword(event.target.value)}
          />
        </FormField>

        <p className={styles.help}>
          Credentials are sent to our server only to log into Binolla and open your session. The
          password is never stored. Partner signup uses {BINOLLA_REFERRAL_SIGNUP_URL}. Referral is
          attribution only — access requires admin approval.
        </p>

        <AuthServerError message={flow.error} />

        <div className={styles.actions}>
          <button
            type="submit"
            className={styles.primaryBtn}
            disabled={flow.status === 'loading' || flow.status === 'success'}
          >
            {flow.status === 'loading'
              ? isLogin
                ? 'Logging into Binolla…'
                : 'Creating Binolla account…'
              : flow.status === 'success'
                ? 'Entering bot…'
                : isLogin
                  ? 'Log in & enter bot'
                  : 'Sign up & enter bot'}
          </button>

          <button
            type="button"
            className={styles.secondaryBtn}
            onClick={() => void flow.enterBotWithTelegram()}
            disabled={flow.status === 'loading'}
          >
            Already linked? Enter bot via Telegram
          </button>

          <button type="button" className={styles.secondaryBtn} onClick={flow.goToOtherMode}>
            {isLogin ? 'New on Binolla? Sign up' : 'Already have Binolla? Log in'}
          </button>
        </div>
      </form>
    </AuthShell>
  );
}
