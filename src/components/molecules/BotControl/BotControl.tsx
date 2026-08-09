import { uiAssets } from '@assets/index';
import { Icon } from '@components/atoms/Icon';
import { Text } from '@components/atoms/Text';
import { cn } from '@utils/cn';
import type { BotControlAction } from '../../types';
import styles from './BotControl.module.css';

export type BotControlProps = {
  action: BotControlAction;
  pressed?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
};

const config: Record<
  BotControlAction,
  { label: string; icon: string; toneClass: string }
> = {
  start: { label: 'Start', icon: uiAssets.play, toneClass: styles.start },
  pause: { label: 'Pause', icon: uiAssets.pause, toneClass: styles.pause },
  stop: { label: 'Stop', icon: uiAssets.stop, toneClass: styles.stop },
  apply: { label: 'Apply', icon: uiAssets.apply, toneClass: styles.apply },
};

export function BotControl({
  action,
  pressed = false,
  disabled = false,
  onClick,
  className,
}: BotControlProps) {
  const { label, icon, toneClass } = config[action];

  return (
    <button
      type="button"
      className={cn(
        styles.control,
        toneClass,
        pressed && styles.pressed,
        disabled && styles.disabled,
        className,
      )}
      aria-pressed={pressed}
      aria-disabled={disabled}
      disabled={disabled}
      title={disabled ? 'Coming Soon — use Trading for manual Demo orders' : undefined}
      onClick={disabled ? undefined : onClick}
    >
      <Icon src={icon} size="sm" />
      <Text variant="caption" className={styles.label}>
        {disabled ? 'Soon' : label}
      </Text>
    </button>
  );
}
