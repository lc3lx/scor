import { Loader } from '@components/atoms/Loader';
import styles from './SplashLoader.module.css';

export function SplashLoader() {
  return (
    <div className={styles.loaderArea}>
      <Loader animated label="Loading Scar Alpha AI" />
    </div>
  );
}
