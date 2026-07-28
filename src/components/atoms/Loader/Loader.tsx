import { uiAssets } from '@assets/index';
import { Icon } from '../Icon';
import styles from './Loader.module.css';

export type LoaderProps = {
  label?: string;
  animated?: boolean;
};

export function Loader({ label = 'Loading', animated = false }: LoaderProps) {
  return (
    <div className={styles.loader} role="status" aria-label={label}>
      <Icon
        src={uiAssets.loader}
        size="loader"
        decorative
        className={animated ? styles.spinning : undefined}
      />
    </div>
  );
}
