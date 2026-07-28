import { navigationAssets } from '@assets/index';
import { Icon } from '@components/atoms/Icon';
import { Text } from '@components/atoms/Text';
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

const tabs: Array<{ id: NavTab; icon: string; label?: string }> = [
  { id: 'home', icon: navigationAssets.homeActive, label: 'Home' },
  { id: 'bot', icon: navigationAssets.bot, label: 'Alpha Bot' },
  { id: 'trades', icon: navigationAssets.trades, label: 'Trades' },
  { id: 'profile', icon: navigationAssets.user, label: 'Account' },
];

export function BottomNavigation({
  activeTab,
  fabActive = false,
  fabLabel,
  onTabChange,
  onFabClick,
  className,
}: BottomNavigationProps) {
  return (
    <nav className={cn(styles.nav, className)} aria-label="Main navigation">
      <Icon
        src={navigationAssets.bottomNavUnion}
        decorative
        className={styles.union}
      />
      <div className={styles.items}>
        {tabs.slice(0, 2).map((tab) => (
          <NavigationItem
            key={tab.id}
            iconSrc={tab.icon}
            label={tab.label}
            active={activeTab === tab.id}
            onClick={() => onTabChange(tab.id)}
          />
        ))}
        <div className={styles.fabCell}>
          <button
            type="button"
            className={styles.fab}
            onClick={onFabClick}
            aria-label={fabLabel ?? 'Scar Alpha'}
            aria-current={fabActive ? 'page' : undefined}
          >
            <Icon src={navigationAssets.fab} size="fab" decorative />
          </button>
          {fabActive && fabLabel && (
            <Text variant="nav" tone="nav-active" className={styles.fabLabel}>
              {fabLabel}
            </Text>
          )}
        </div>
        {tabs.slice(2).map((tab) => (
          <NavigationItem
            key={tab.id}
            iconSrc={tab.icon}
            label={tab.label}
            active={activeTab === tab.id}
            onClick={() => onTabChange(tab.id)}
          />
        ))}
      </div>
    </nav>
  );
}
