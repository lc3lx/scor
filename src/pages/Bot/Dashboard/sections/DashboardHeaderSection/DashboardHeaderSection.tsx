import { dashboardAssets } from '@assets/index';
import { Icon } from '@components/atoms/Icon';
import { Text } from '@components/atoms/Text';
import styles from './DashboardHeaderSection.module.css';

export type DashboardHeaderSectionProps = {
  greeting: string;
  userName: string;
  waveEmoji: string;
  notificationsAriaLabel: string;
  hasUnread: boolean;
  onNotificationsClick: () => void;
};

export function DashboardHeaderSection({
  greeting,
  userName,
  waveEmoji,
  notificationsAriaLabel,
  hasUnread,
  onNotificationsClick,
}: DashboardHeaderSectionProps) {
  return (
    <header className={styles.header}>
      <div className={styles.identity}>
        <img
          src={dashboardAssets.avatar}
          alt=""
          className={styles.avatar}
          width={42}
          height={42}
        />
        <div className={styles.copy}>
          <Text variant="caption" tone="primary" className={styles.greeting}>
            {greeting}
          </Text>
          <div className={styles.nameRow}>
            <Text variant="h2" tone="primary" className={styles.name}>
              {userName}
            </Text>
            <span className={styles.wave} aria-hidden="true">
              {waveEmoji}
            </span>
          </div>
        </div>
      </div>

      <button
        type="button"
        className={styles.bellButton}
        aria-label={notificationsAriaLabel}
        onClick={onNotificationsClick}
      >
        <Icon src={dashboardAssets.notifBell} decorative className={styles.bellIcon} />
        {hasUnread ? <span className={styles.badge} aria-hidden="true" /> : null}
      </button>
    </header>
  );
}
