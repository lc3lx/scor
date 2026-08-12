import { Link } from 'react-router-dom';
import { Text } from '@components/atoms/Text';
import { BINOLLA_REFERRAL_LABEL } from '@constants/binolla';
import { ROUTES } from '@constants/routes';
import type { AccountStatus } from '../../types';
import styles from './ApprovalNoticeSection.module.css';

export type ApprovalNoticeSectionProps = {
  accountStatus: AccountStatus;
  binollaConnected: boolean;
  botAccess?: string;
};

export function ApprovalNoticeSection({
  accountStatus,
  binollaConnected,
  botAccess,
}: ApprovalNoticeSectionProps) {
  if (botAccess === 'SessionExpired') {
    return (
      <section className={styles.section} aria-label="Session expired">
        <div className={styles.card} data-tone="warning">
          <Text variant="body" tone="body" className={styles.title}>
            Binolla session expired
          </Text>
          <Text variant="caption" tone="caption" className={styles.body}>
            Your Binolla WebSocket session dropped (token expired or server restart). Approval
            status stays Pending — just log in again with the same Binolla email and password.
          </Text>
          <Link className={styles.link} to={ROUTES.login}>
            Reconnect Binolla login
          </Link>
        </div>
      </section>
    );
  }

  if (!binollaConnected && accountStatus !== 'rejected') {
    return (
      <section className={styles.section} aria-label="Access notice">
        <div className={styles.card} data-tone="info">
          <Text variant="body" tone="body" className={styles.title}>
            Connect Binolla
          </Text>
          <Text variant="caption" tone="caption" className={styles.body}>
            Log in or sign up with your Binolla email and password. We connect the session
            automatically. An administrator will review your account after you connect.
          </Text>
          <Link className={styles.link} to={ROUTES.signup}>
            {BINOLLA_REFERRAL_LABEL}
          </Link>
          <Link className={styles.link} to={ROUTES.login}>
            Log in to Binolla
          </Link>
        </div>
      </section>
    );
  }

  if (accountStatus === 'pending') {
    return (
      <section className={styles.section} aria-label="Approval pending">
        <div className={styles.card} data-tone="warning">
          <Text variant="body" tone="body" className={styles.title}>
            Binolla Connected
          </Text>
          <Text variant="caption" tone="caption" className={styles.body}>
            Administrator has not approved your account yet. You can use markets, charts, and RSI
            signals. Trading stays locked until an administrator approves you.
          </Text>
        </div>
      </section>
    );
  }

  if (accountStatus === 'rejected') {
    return (
      <section className={styles.section} aria-label="Approval rejected">
        <div className={styles.card} data-tone="danger">
          <Text variant="body" tone="body" className={styles.title}>
            Access not granted
          </Text>
          <Text variant="caption" tone="caption" className={styles.body}>
            This Binolla account was rejected by an administrator. Contact support if you believe
            this is a mistake.
          </Text>
        </div>
      </section>
    );
  }

  return null;
}
