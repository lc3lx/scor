import { brandAssets } from '@assets/index';
import { Button } from '@components/atoms/Button';
import { Icon } from '@components/atoms/Icon';
import { HomeHeader } from '@components/organisms/HomeHeader';
import { ROUTES } from '@constants/routes';
import { useT } from '@shared/i18n';
import { useNavigate } from 'react-router-dom';
import type { HomeHeaderContent } from '../../types';
import styles from './HomeHeaderSection.module.css';

export type HomeHeaderSectionProps = {
  content: HomeHeaderContent;
};

export function HomeHeaderSection({ content }: HomeHeaderSectionProps) {
  const t = useT();
  const navigate = useNavigate();
  const notificationAction = content.notificationAction;

  return (
    <HomeHeader
      brandName={t('home.bot.name')}
      logoSrc={brandAssets.scarTile}
      className={styles.section}
      action={
        notificationAction ? (
          <Button
            variant="icon"
            className={styles.notificationButton}
            aria-label={notificationAction.ariaLabel}
            onClick={() => navigate(ROUTES.notifications)}
          >
            <Icon src={notificationAction.iconSrc} size="notification" decorative />
          </Button>
        ) : undefined
      }
    />
  );
}
