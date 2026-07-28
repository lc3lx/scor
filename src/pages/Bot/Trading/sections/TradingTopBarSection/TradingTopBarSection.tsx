import { brandAssets } from '@assets/index';
import { Button } from '@components/atoms/Button';
import { Chip } from '@components/atoms/Chip';
import { Icon } from '@components/atoms/Icon';
import type { TradingTopBarContent } from '../../types';
import styles from './TradingTopBarSection.module.css';

export type TradingTopBarSectionProps = {
  content: TradingTopBarContent;
  onRefresh?: () => void;
  onExport?: () => void;
};

export function TradingTopBarSection({ content, onRefresh, onExport }: TradingTopBarSectionProps) {
  return (
    <section className={styles.section} aria-label="Trading header">
      <div className={styles.brand}>
        <div className={styles.brandIcon}>
          <Icon src={brandAssets.scarTile} size="sm" decorative />
        </div>
        <div className={styles.brandText} role="img" aria-label="Scar Alpha AI">
          <Icon src={brandAssets.logoPart2} size="fill" decorative className={styles.logoIcon} />
          <Icon src={brandAssets.logoPart3} size="fill" decorative className={styles.logoAlpha} />
          <Icon src={brandAssets.logoPart1} size="fill" decorative className={styles.logoScar} />
        </div>
      </div>

      <div className={styles.actions}>
        <Chip label={content.connectionLabel} tone={content.connectionTone} style="solid" />
        <Button variant="icon" className={styles.actionButton} aria-label={content.refreshAriaLabel} onClick={onRefresh}>
          <Icon src={content.refreshIconSrc} size="xs" decorative />
        </Button>
        <Button variant="icon" className={styles.actionButton} aria-label={content.exportAriaLabel} onClick={onExport}>
          <Icon src={content.exportIconSrc} size="xs" decorative />
        </Button>
      </div>
    </section>
  );
}
