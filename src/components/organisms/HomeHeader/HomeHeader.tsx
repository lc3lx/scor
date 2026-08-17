import type { ReactNode } from 'react';
import { Text } from '@components/atoms/Text';
import { cn } from '@utils/cn';
import styles from './HomeHeader.module.css';

export type HomeHeaderProps = {
  brandName: string;
  logoSrc: string;
  action?: ReactNode;
  className?: string;
};

export function HomeHeader({ brandName, logoSrc, action, className }: HomeHeaderProps) {
  return (
    <header className={cn(styles.header, className)}>
      <div className={styles.brand} role="img" aria-label={brandName}>
        <div className={styles.logoTile}>
          <img src={logoSrc} alt="" className={styles.logo} width={28} height={28} />
        </div>
        <Text variant="body" tone="body" className={styles.brandName}>
          {brandName}
        </Text>
      </div>
      {action ? <div className={styles.action}>{action}</div> : null}
    </header>
  );
}
