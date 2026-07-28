import { navigationAssets } from '@assets/index';
import { Icon } from '@components/atoms/Icon';
import { NavigationItem } from '@components/molecules/NavigationItem';
import { cn } from '@utils/cn';
import type { NavTab } from '../../types';
import styles from './BottomNavigation.module.css';

export type BottomNavigationProps = {
  activeTab: NavTab | null;
  fabActive?: boolean;
  fabLabel?: string;
  onTabChange: (tab: NavTab) => void;
  onFabClick?: () => void;
  className?: string;
};

const tabs: Array<{
  id: NavTab;
  icon: string;
  activeIcon: string;
  label: string;
  iconClassName?: string;
}> = [
  {
    id: 'home',
    icon: navigationAssets.home,
    activeIcon: navigationAssets.homeActive,
    label: 'Home',
  },
  {
    id: 'bot',
    icon: navigationAssets.bot,
    activeIcon: navigationAssets.botActive,
    label: 'Alpha Bot',
  },
  {
    id: 'trades',
    icon: navigationAssets.trades,
    activeIcon: navigationAssets.tradesActive,
    label: 'Trades',
    iconClassName: styles.tradesIcon,
  },
  {
    id: 'profile',
    icon: navigationAssets.user,
    activeIcon: navigationAssets.userActive,
    label: 'Account',
  },
];

export function BottomNavigation({
  activeTab,
  fabActive = false,
  onTabChange,
  onFabClick,
  className,
}: BottomNavigationProps) {
  const leftTabs = tabs.slice(0, 2);
  const rightTabs = tabs.slice(2);

  return (
    <nav className={cn(styles.nav, className)} aria-label="Main navigation">
      <Icon src={navigationAssets.bottomNavUnion} decorative className={styles.union} />

      <div className={styles.items}>
        <NavigationItem
          iconSrc={activeTab === leftTabs[0].id ? leftTabs[0].activeIcon : leftTabs[0].icon}
          iconClassName={leftTabs[0].iconClassName}
          label={leftTabs[0].label}
          active={activeTab === leftTabs[0].id}
          onClick={() => onTabChange(leftTabs[0].id)}
        />
        <span className={styles.gap} aria-hidden="true" />
        <NavigationItem
          iconSrc={activeTab === leftTabs[1].id ? leftTabs[1].activeIcon : leftTabs[1].icon}
          iconClassName={leftTabs[1].iconClassName}
          label={leftTabs[1].label}
          active={activeTab === leftTabs[1].id}
          onClick={() => onTabChange(leftTabs[1].id)}
        />
        <div className={styles.fabSpacer} aria-hidden="true" />
        <NavigationItem
          iconSrc={activeTab === rightTabs[0].id ? rightTabs[0].activeIcon : rightTabs[0].icon}
          iconClassName={rightTabs[0].iconClassName}
          label={rightTabs[0].label}
          active={activeTab === rightTabs[0].id}
          onClick={() => onTabChange(rightTabs[0].id)}
        />
        <span className={styles.gap} aria-hidden="true" />
        <NavigationItem
          iconSrc={activeTab === rightTabs[1].id ? rightTabs[1].activeIcon : rightTabs[1].icon}
          iconClassName={rightTabs[1].iconClassName}
          label={rightTabs[1].label}
          active={activeTab === rightTabs[1].id}
          onClick={() => onTabChange(rightTabs[1].id)}
        />
      </div>

      <button
        type="button"
        className={styles.fab}
        onClick={onFabClick}
        aria-label="Scar Alpha"
        aria-current={fabActive ? 'page' : undefined}
      >
        <Icon src={navigationAssets.fabIcon} decorative className={styles.fabIcon} />
      </button>
    </nav>
  );
}
