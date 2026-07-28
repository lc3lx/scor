import { Button } from '@components/atoms/Button';
import { Chip } from '@components/atoms/Chip';
import { Text } from '@components/atoms/Text';
import type { ScarAlphaSignalCardContent, TradingSignalStat } from '../../types';
import { TradingBrandIcon, TradingBrandWordmark } from '../../components/TradingBrandMark';
import styles from './ScarAlphaSignalCardSection.module.css';

export type ScarAlphaSignalCardSectionProps = {
  content: ScarAlphaSignalCardContent;
  onOpenBot: () => void;
};

function SignalStatValue({ stat }: { stat: TradingSignalStat }) {
  if (stat.id === 'signal') {
    return (
      <span className={styles.signalValue}>
        <span className={styles.signalUp}>UP </span>
        <span className={styles.signalArrow}>↑</span>
      </span>
    );
  }

  return (
    <Text variant="caption" tone="primary" align="right" className={styles.statValue}>
      {stat.value}
    </Text>
  );
}

export function ScarAlphaSignalCardSection({ content, onOpenBot }: ScarAlphaSignalCardSectionProps) {
  const primaryStats = content.stats.slice(0, 4);
  const marketStat = content.stats.find((stat) => stat.id === 'market');

  return (
    <section className={styles.section} aria-label="Scar Alpha AI signal">
      <article className={styles.card}>
        <header className={styles.header}>
          <TradingBrandIcon variant="signal" />
          <TradingBrandWordmark />
          <Chip
            label={content.freshLabel}
            tone={content.freshTone}
            style="solid"
            className={styles.freshChip}
          />
        </header>

        <div className={styles.statsBlock}>
          <div className={styles.statsGrid}>
            {primaryStats.map((stat) => (
              <div key={stat.id} className={styles.statCell}>
                <Text variant="caption" tone="primary" className={styles.statLabel}>
                  {stat.label}
                </Text>
                <SignalStatValue stat={stat} />
              </div>
            ))}
          </div>

          {marketStat && (
            <div className={styles.marketRow}>
              <Text variant="caption" tone="primary" className={styles.statLabel}>
                {marketStat.label}
              </Text>
              <Text variant="caption" tone="primary" align="right" className={styles.statValue}>
                {marketStat.value}
              </Text>
            </div>
          )}
        </div>

        <Button className={styles.cta} onClick={onOpenBot}>
          {content.ctaLabel}
        </Button>
      </article>
    </section>
  );
}
