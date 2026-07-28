import { Button } from '@components/atoms/Button';
import { Icon } from '@components/atoms/Icon';
import { Input } from '@components/atoms/Input';
import { Text } from '@components/atoms/Text';
import { CandlestickChart } from '@components/organisms/CandlestickChart';
import { uiAssets } from '@assets/index';
import type { BinollaCardContent } from '../../types';
import styles from './BinollaTradingCardSection.module.css';

export type BinollaTradingCardSectionProps = {
  content: BinollaCardContent;
  amount: string;
  durationLabel: string;
  expiryDisplay: string;
  onAmountChange: (value: string) => void;
  onTradeUp: () => void;
  onTradeDown: () => void;
};

export function BinollaTradingCardSection({
  content,
  amount,
  durationLabel,
  expiryDisplay,
  onAmountChange,
  onTradeUp,
  onTradeDown,
}: BinollaTradingCardSectionProps) {
  return (
    <section className={styles.section} aria-label="Binolla trading">
      <article className={styles.card}>
        <header className={styles.header}>
          <div className={styles.platform}>
            <div className={styles.platformIcon}>
              <Icon src={content.platformIconSrc} size="xs" decorative />
            </div>
            <Text variant="caption-xs" tone="body">
              {content.platformLabel}
            </Text>
          </div>
          <Text variant="caption-xs" tone="caption" className={styles.balance}>
            {content.balancePrefix}
            <Text as="span" variant="caption-xs" tone="body">
              {content.balanceValue}
            </Text>
          </Text>
        </header>

        <div className={styles.marketRow}>
          <div className={styles.pairBlock}>
            <div className={styles.pairLine}>
              <Text variant="body-sm" tone="body" className={styles.pairName}>
                {content.pairName}
              </Text>
              <Text variant="caption-xs" tone="caption" className={styles.pairSuffix}>
                {content.pairSuffix}
              </Text>
            </div>
            <Text variant="caption-xs" tone="success" className={styles.price}>
              {content.priceDisplay}
            </Text>
          </div>
          <div className={styles.expiryBlock}>
            <Text variant="caption-xs" tone="caption" align="right">
              {content.expiryLabel}
            </Text>
            <Text variant="caption" tone="body" align="right" className={styles.expiryValue}>
              {expiryDisplay}
            </Text>
          </div>
        </div>

        <div className={styles.chartWrap}>
          <CandlestickChart
            data={content.candleData}
            width={345}
            height={160}
            className={styles.chart}
          />
        </div>

        <div className={styles.controls}>
          <div className={styles.fieldGroup}>
            <Text variant="caption-xs" tone="caption" className={styles.fieldLabel}>
              {content.amountLabel}
            </Text>
            <div className={styles.field}>
              <Text variant="caption" tone="body" className={styles.fieldPrefix}>
                {content.amountPrefix}
              </Text>
              <Input
                className={styles.amountInput}
                value={amount}
                inputMode="decimal"
                aria-label={content.amountLabel}
                onChange={(event) => onAmountChange(event.target.value)}
              />
            </div>
          </div>

          <div className={styles.fieldGroup}>
            <Text variant="caption-xs" tone="caption" className={styles.fieldLabel}>
              {content.durationLabel}
            </Text>
            <div className={styles.field}>
              <Text variant="caption" tone="body" className={styles.durationValue}>
                {durationLabel}
              </Text>
              <Icon src={uiAssets.chevronNav} size="xs" decorative className={styles.durationChevron} />
            </div>
          </div>
        </div>

        <div className={styles.tradeActions}>
          <Button className={styles.tradeButtonUp} onClick={onTradeUp}>
            <Icon src={content.upIconSrc} size="xs" decorative />
            <Text variant="body-sm" tone="primary">
              {content.upLabel}
            </Text>
          </Button>
          <Button className={styles.tradeButtonDown} onClick={onTradeDown}>
            <Icon src={content.downIconSrc} size="xs" decorative />
            <Text variant="body-sm" tone="primary">
              {content.downLabel}
            </Text>
          </Button>
        </div>
      </article>
    </section>
  );
}
