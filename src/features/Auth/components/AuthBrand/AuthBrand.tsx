import { brandAssets } from '@assets/index';
import { Icon } from '@components/atoms/Icon';
import styles from './AuthBrand.module.css';

export function AuthBrand() {
  return (
    <div className={styles.brand} role="img" aria-label="Scar Alpha AI">
      <Icon
        src={brandAssets.logoPart2}
        size="fill"
        decorative={false}
        alt=""
        className={styles.partIcon}
      />
      <Icon
        src={brandAssets.logoPart3}
        size="fill"
        decorative={false}
        alt=""
        className={styles.partAlpha}
      />
      <Icon
        src={brandAssets.logoPart1}
        size="fill"
        decorative={false}
        alt=""
        className={styles.partScar}
      />
    </div>
  );
}
