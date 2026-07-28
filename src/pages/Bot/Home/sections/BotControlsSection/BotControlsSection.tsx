import { BotControl } from '@components/molecules/BotControl';
import type { BotControlAction } from '@components/types';
import styles from './BotControlsSection.module.css';

export type BotControlsSectionProps = {
  controls: BotControlAction[];
  isStartPressed: boolean;
  onStart: () => void;
  onPause: () => void;
  onStop: () => void;
  onApply: () => void;
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
}: BotControlsSectionProps) {
  const handlerMap = { onStart, onPause, onStop, onApply };

  return (
    <section className={styles.section} aria-label="Bot controls">
      <div className={styles.card}>
        {controls.map((action) => (
          <BotControl
            key={action}
            action={action}
            pressed={action === 'start' && isStartPressed}
            onClick={handlerMap[handlers[action]]}
            className={styles.control}
          />
        ))}
      </div>
    </section>
  );
}
