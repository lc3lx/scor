import { imageAssets, uiAssets } from '@assets/index';
import { Icon } from '@components/atoms/Icon';
import { Text } from '@components/atoms/Text';
import { cn } from '@utils/cn';
import styles from './TradingPreviewCard.module.css';

export type TradingPreviewCardProps = {
  pair?: string;
  timer?: string;
  className?: string;
};

export function TradingPreviewCard({
  pair = 'Trading · EUR/USD',
  timer = '00:43',
  className,
}: TradingPreviewCardProps) {
  return (
    <article className={cn(styles.card, className)} aria-label="Trading preview">
      <header className={styles.header}>
        <div className={styles.pairInfo}>
          <span className={styles.chartIconWrap}>
            <Icon src={uiAssets.chart} size="xs" decorative />
          </span>
          <Text variant="caption-xs" tone="connector">
            {pair}
          </Text>
        </div>
        <Text variant="caption-xs" tone="connector" className={styles.timer}>
          {timer}
        </Text>
      </header>

      <div className={styles.chartWrap}>
        <img src={imageAssets.onboardingChart} alt="" className={styles.chart} />
      </div>

      <footer className={styles.actions}>
        <div className={cn(styles.tradeButton, styles.upButton)}>
          <Icon src={uiAssets.upArrow} size="xs" decorative />
          <Text variant="caption" tone="primary" className={styles.tradeLabel}>
            UP
          </Text>
        </div>
        <div className={cn(styles.tradeButton, styles.downButton)}>
          <Icon src={uiAssets.downArrow} size="xs" decorative />
          <Text variant="caption" tone="primary" className={styles.tradeLabel}>
            DOWN
          </Text>
        </div>
      </footer>
    </article>
  );
}
