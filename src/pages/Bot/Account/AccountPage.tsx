import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageContent } from '@components/layouts/PageContent';
import { ROUTES } from '@constants/routes';
import { useAccountData } from './hooks/useAccountData';
import { AccountDetailsSection } from './sections/AccountDetailsSection';
import { AccountFooterSection } from './sections/AccountFooterSection';
import { AccountHeaderSection } from './sections/AccountHeaderSection';
import { AccountMenuSection } from './sections/AccountMenuSection';
import { AccountProfileSection } from './sections/AccountProfileSection';
import type { AccountMenuItem } from './types';
import styles from './AccountPage.module.css';

export default function AccountPage() {
  const navigate = useNavigate();
  const { snapshot, isLoading, logout } = useAccountData();

  const handleMenuSelect = useCallback(
    (item: AccountMenuItem) => {
      if (item.route) {
        navigate(item.route);
        return;
      }

      if (item.action === 'education') {
        window.open('https://scaralpha.ai/education', '_blank', 'noopener,noreferrer');
      }
    },
    [navigate],
  );

  const handleLogout = useCallback(async () => {
    await logout();
    navigate(ROUTES.login);
  }, [logout, navigate]);

  if (isLoading || !snapshot) return null;

  return (
    <main className={styles.page} aria-label="Account">
      <div className={styles.scroll}>
        <PageContent className={styles.content}>
          <AccountHeaderSection title={snapshot.pageContent.title} />
          <AccountProfileSection profile={snapshot.profile} badges={snapshot.badges} />
          <AccountDetailsSection items={snapshot.details} />
          <AccountMenuSection
            items={snapshot.menuItems}
            logoutLabel={snapshot.pageContent.logoutLabel}
            onItemSelect={handleMenuSelect}
            onLogout={handleLogout}
          />
          <AccountFooterSection versionLabel={snapshot.pageContent.versionLabel} />
        </PageContent>
      </div>
    </main>
  );
}
