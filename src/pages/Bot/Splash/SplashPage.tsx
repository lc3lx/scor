import { SplashBrand } from './sections/SplashBrand';
import { SplashGlow } from './sections/SplashGlow';
import { SplashLoader } from './sections/SplashLoader';
import styles from './SplashPage.module.css';

export default function SplashPage() {
  return (
    <main className={styles.page} aria-label="Splash">
      <SplashGlow />
      <div className={styles.content}>
        <SplashBrand />
      </div>
      <footer className={styles.footer}>
        <SplashLoader />
      </footer>
    </main>
  );
}
