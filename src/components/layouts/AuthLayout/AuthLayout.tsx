import { Outlet } from 'react-router-dom';
import styles from './AuthLayout.module.css';

export function AuthLayout() {
  return (
    <section className={styles.layout} aria-label="Authentication">
      <Outlet />
    </section>
  );
}
