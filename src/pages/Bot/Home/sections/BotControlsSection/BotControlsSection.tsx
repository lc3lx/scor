import { BotControl } from '@components/molecules/BotControl';
import { Text } from '@components/atoms/Text';
import type { BotControlAction } from '@components/types';
import styles from './BotControlsSection.module.css';

export type BotControlsSectionProps = {
  controls: BotControlAction[];
  isStartPressed: boolean;
  onStart: () => void;
  onPause: () => void;
  onStop: () => void;
  onApply: () => void;
  /** Phase 9: auto Start/Pause/Stop is out of scope — show Coming Soon. */
  comingSoon?: boolean;
};

const handlers: Record<
  BotControlAction,
  keyof Pick<BotControlsSectionProps, 'onStart' | 'onPause' | 'onStop' | 'onApply'>
> = {
  start: 'onStart',
  pause: 'onPause',
  stop: 'onStop',
  apply: 'onApply',
};

export function BotControlsSection({
  controls,
  isStartPressed,
  onStart,
  onPause,
  onStop,
  onApply,
  comingSoon = true,
}: BotControlsSectionProps) {
  const handlerMap = { onStart, onPause, onStop, onApply };

  return (
    <section className={styles.section} aria-label="Bot controls">
      <div className={styles.card}>
        {controls.map((action) => (
          <BotControl
            key={action}
            action={action}
            pressed={!comingSoon && action === 'start' && isStartPressed}
            disabled={comingSoon}
            onClick={handlerMap[handlers[action]]}
            className={styles.control}
          />
        ))}
      </div>
      {comingSoon ? (
        <Text variant="caption-xs" tone="caption" align="center" className={styles.soonNote}>
          Coming Soon — auto Start/Pause/Stop is disabled. Place Demo trades manually on Trading.
        </Text>
      ) : null}
    </section>
  );
}
