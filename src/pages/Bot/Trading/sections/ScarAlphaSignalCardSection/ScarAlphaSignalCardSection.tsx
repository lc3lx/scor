import { brandAssets } from '@assets/index';
import { Button } from '@components/atoms/Button';
import { Chip } from '@components/atoms/Chip';
import { Icon } from '@components/atoms/Icon';
import { Text } from '@components/atoms/Text';
import type { ScarAlphaSignalCardContent } from '../../types';
import styles from './ScarAlphaSignalCardSection.module.css';

export type ScarAlphaSignalCardSectionProps = {
  content: ScarAlphaSignalCardContent;
  onOpenBot: () => void;
};

export function ScarAlphaSignalCardSection({ content, onOpenBot }: ScarAlphaSignalCardSectionProps) {
  const primaryStats = content.stats.slice(0, 4);
  const marketStat = content.stats.find((stat) => stat.id === 'market');

  return (
    <section className={styles.section} aria-label="Scar Alpha AI signal">
      <article className={styles.card}>
        <header className={styles.header}>
          <div className={styles.brandIcon}>
            <Icon src={content.brandIconSrc} size="xs" decorative />
          </div>
          <div className={styles.brandText} role="img" aria-label="Scar Alpha AI">
            <Icon src={brandAssets.logoPart2} size="fill" decorative className={styles.logoIcon} />
            <Icon src={brandAssets.logoPart3} size="fill" decorative className={styles.logoAlpha} />
            <Icon src={brandAssets.logoPart1} size="fill" decorative className={styles.logoScar} />
          </div>
          <Chip label={content.freshLabel} tone={content.freshTone} style="solid" className={styles.freshChip} />
        </header>

        <div className={styles.statsGrid}>
          {primaryStats.map((stat) => (
            <div key={stat.id} className={styles.statRow}>
              <Text variant="caption-xs" tone="muted">
                {stat.label}
              </Text>
              <Text
                variant="caption-xs"
                tone={stat.valueTone === 'success' ? 'success' : 'body'}
                align="right"
              >
                {stat.value}
              </Text>
            </div>
          ))}
        </div>

        {marketStat && (
          <div className={styles.marketRow}>
            <Text variant="caption-xs" tone="muted">
              {marketStat.label}
            </Text>
            <Text variant="caption-xs" tone="body" align="right">
              {marketStat.value}
            </Text>
          </div>
        )}

        <Button className={styles.cta} onClick={onOpenBot}>
          {content.ctaLabel}
        </Button>
      </article>
    </section>
  );
}
