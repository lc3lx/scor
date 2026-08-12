import { Button } from '@components/atoms/Button';
import { Icon } from '@components/atoms/Icon';
import { Input } from '@components/atoms/Input';
import { Text } from '@components/atoms/Text';
import { CandlestickChart } from '@components/organisms/CandlestickChart';
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
              <Icon src={content.platformIconSrc} decorative className={styles.platformIconImage} />
            </div>
            <Text variant="caption" tone="primary" className={styles.platformLabel}>
              {content.platformLabel}
            </Text>
          </div>
          <Text variant="caption-xs" tone="caption" className={styles.balance}>
            {content.balancePrefix}
            <Text as="span" variant="caption-xs" tone="primary">
              {content.balanceValue}
            </Text>
          </Text>
        </header>

        <div className={styles.marketRow}>
          <div className={styles.pairBlock}>
            <div className={styles.pairLine}>
              <Text variant="body-sm" tone="primary" className={styles.pairName}>
                {content.pairName}
              </Text>
              <Text variant="caption-xs" tone="caption" className={styles.pairSuffix}>
                {content.pairSuffix}
              </Text>
            </div>
            <p className={styles.price}>{content.priceDisplay}</p>
          </div>
          <div className={styles.expiryBlock}>
            <Text variant="caption-xs" tone="caption" align="right" className={styles.expiryLabel}>
              {content.expiryLabel}
            </Text>
            <Text variant="caption" tone="primary" align="right" className={styles.expiryValue}>
              {expiryDisplay}
            </Text>
          </div>
        </div>

        <div className={styles.chartWrap}>
          {content.candleData.length > 0 ? (
            <CandlestickChart
              data={content.candleData}
              width={345}
              height={160}
              className={styles.chart}
            />
          ) : (
            <div className={styles.chartEmpty} role="img" aria-label="Binolla chart unavailable">
              <Text variant="caption" tone="caption" align="center">
                {content.chartStatusLabel ?? 'No Binolla candles yet'}
              </Text>
            </div>
          )}
        </div>

        <div className={styles.controls}>
          <div className={styles.fieldRow}>
            <div className={styles.fieldGroup}>
              <span className={styles.fieldLabel}>{content.amountLabel}</span>
              <div className={styles.field}>
                <span className={styles.fieldPrefix}>{content.amountPrefix}</span>
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
              <span className={styles.fieldLabel}>{content.durationLabel}</span>
              <div className={styles.field}>
                <Text variant="caption" tone="primary" className={styles.durationValue}>
                  {durationLabel}
                </Text>
                <Icon src={content.durationChevronSrc} decorative className={styles.durationChevron} />
              </div>
            </div>
          </div>

          <div className={styles.tradeActions}>
            <Button
              className={styles.tradeButtonUp}
              onClick={onTradeUp}
              disabled={content.tradesDisabled}
            >
              <Icon src={content.upIconSrc} decorative className={styles.tradeIcon} />
              <span className={styles.tradeLabel}>{content.upLabel}</span>
            </Button>
            <Button
              className={styles.tradeButtonDown}
              onClick={onTradeDown}
              disabled={content.tradesDisabled}
            >
              <Icon src={content.downIconSrc} decorative className={styles.tradeIcon} />
              <span className={styles.tradeLabel}>{content.downLabel}</span>
            </Button>
          </div>
          {content.tradesDisabled && content.tradeLockMessage ? (
            <Text variant="caption" tone="caption" className={styles.tradeLock}>
              {content.tradeLockMessage}
            </Text>
          ) : null}
        </div>
      </article>
    </section>
  );
}
