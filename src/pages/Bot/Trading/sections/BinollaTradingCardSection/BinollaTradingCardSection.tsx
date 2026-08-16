import { Icon } from '@components/atoms/Icon';
import { Text } from '@components/atoms/Text';
import { CandlestickChart } from '@components/organisms/CandlestickChart';
import { useEffect, useState } from 'react';
import { useT } from '@shared/i18n';
import type { BinollaCardContent } from '../../types';
import styles from './BinollaTradingCardSection.module.css';

export type BinollaTradingCardSectionProps = {
  content: BinollaCardContent;
};

function remainingSeconds(createdAt: string, durationSeconds: number): number {
  const start = new Date(createdAt).getTime();
  if (!Number.isFinite(start) || durationSeconds <= 0) return 0;
  const endsAt = start + durationSeconds * 1000;
  return Math.max(0, Math.ceil((endsAt - Date.now()) / 1000));
}

function formatCountdown(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function formatEntryTime(iso: string): string {
  const d = new Date(iso);
  if (!Number.isFinite(d.getTime())) return '—';
  return d.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
}

/** A read-only market monitor. Scar Alpha opens and closes trades autonomously. */
export function BinollaTradingCardSection({ content }: BinollaTradingCardSectionProps) {
  const t = useT();
  const last = content.candleData[content.candleData.length - 1];
  const priceTone = last == null ? undefined : last.close >= last.open ? 'up' : 'down';
  const pair = content.pairSymbol ?? content.pairName;
  const active = content.activeTrade;
  const [leftSec, setLeftSec] = useState(() =>
    active ? remainingSeconds(active.createdAt, active.durationSeconds) : 0,
  );

  useEffect(() => {
    if (!active) {
      setLeftSec(0);
      return;
    }
    const tick = () => setLeftSec(remainingSeconds(active.createdAt, active.durationSeconds));
    tick();
    const id = window.setInterval(tick, 1000);
    // #region agent log
    fetch('http://127.0.0.1:7892/ingest/aea6d51e-f3e9-4c7e-b6b4-db55c4306e97', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': '1892a4' },
      body: JSON.stringify({
        sessionId: '1892a4',
        runId: 'countdown',
        hypothesisId: 'TIME1',
        location: 'BinollaTradingCardSection.tsx:countdown',
        message: 'countdown_armed',
        data: {
          asset: active.asset,
          durationSeconds: active.durationSeconds,
          createdAt: active.createdAt,
          leftSec: remainingSeconds(active.createdAt, active.durationSeconds),
          entryLocal: formatEntryTime(active.createdAt),
        },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion
    return () => window.clearInterval(id);
  }, [active?.id, active?.createdAt, active?.durationSeconds]);

  return (
    <section className={styles.section} aria-label={t('nav.trading')}>
      <article className={styles.card}>
        <header className={styles.header}>
          <div className={styles.platform}>
            <div className={styles.platformIcon}>
              <Icon src={content.platformIconSrc} decorative className={styles.platformIconImage} />
            </div>
            <div>
              <Text variant="caption" tone="primary" className={styles.platformLabel}>
                {content.platformLabel}
              </Text>
              <Text variant="caption-xs" tone="muted" className={styles.monitorLabel}>
                {t('trading.monitorOnly')}
              </Text>
            </div>
          </div>
          <Text variant="caption-xs" tone="caption" className={styles.balance}>
            {content.balancePrefix}{' '}
            <Text as="span" variant="caption-xs" tone="primary">
              {content.balanceValue}
            </Text>
          </Text>
        </header>

        <div className={styles.marketBar}>
          <div>
            <Text variant="body-sm" tone="primary" className={styles.pairName}>
              {pair}
              {content.pairSuffix ? ` · ${content.pairSuffix}` : ''}
            </Text>
            <p className={styles.price} data-tone={priceTone}>
              {content.priceDisplay}
            </p>
          </div>
          <span className={styles.liveBadge} aria-label={t('trading.liveMarket')}>
            <span className={styles.liveDot} />
            {t('trading.liveMarket')}
          </span>
        </div>

        {active ? (
          <div className={styles.activeTrade} aria-live="polite">
            <span className={styles.activeDot} />
            <div className={styles.activeTradeBody}>
              <Text variant="caption-xs" tone="primary">
                {active.direction} {active.asset}
                {' · '}${active.amount.toFixed(2)}
              </Text>
              <Text variant="caption-xs" tone="caption" className={styles.activeTradeMeta}>
                {t('trading.entryAt', { time: formatEntryTime(active.createdAt) })}
                {' · '}
                {t('trading.remaining', { time: formatCountdown(leftSec) })}
              </Text>
            </div>
          </div>
        ) : null}

        <div className={styles.chartWrap}>
          {content.candleData.length > 0 ? (
            <CandlestickChart
              data={content.candleData}
              height={640}
              visibleBars={48}
              className={styles.chart}
            />
          ) : (
            <div className={styles.chartEmpty} role="img" aria-label={t('trading.noCandlesFallback')}>
              <Text variant="caption" tone="caption" align="center">
                {content.chartStatusLabel ?? t('trading.noCandlesFallback')}
              </Text>
            </div>
          )}
        </div>
      </article>
    </section>
  );
}
