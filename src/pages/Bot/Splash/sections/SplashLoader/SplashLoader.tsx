import { useEffect } from 'react';
import { Loader } from '@components/atoms/Loader';
import styles from './SplashLoader.module.css';

// #region agent log
function agentLog(
  hypothesisId: string,
  location: string,
  message: string,
  data: Record<string, unknown> = {},
) {
  const payload = {
    sessionId: '660ec2',
    runId: 'post-fix',
    hypothesisId,
    location,
    message,
    data,
    timestamp: Date.now(),
  };
  fetch('http://127.0.0.1:7892/ingest/aea6d51e-f3e9-4c7e-b6b4-db55c4306e97', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': '660ec2' },
    body: JSON.stringify(payload),
  }).catch(() => {});
  const base = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/+$/, '') ?? '';
  fetch(`${base}/api/debug/agent-log`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  }).catch(() => {});
}
// #endregion

export function SplashLoader() {
  useEffect(() => {
    const img = document.querySelector('[aria-label="Loading Scar Alpha AI"] img');
    if (!(img instanceof HTMLElement)) {
      agentLog('S', 'SplashLoader:mount', 'loader img missing');
      return;
    }
    const cs = window.getComputedStyle(img);
    agentLog('S', 'SplashLoader:computed', 'loader animation style', {
      animationName: cs.animationName,
      animationDuration: cs.animationDuration,
      animationPlayState: cs.animationPlayState,
      reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    });
  }, []);

  return (
    <div className={styles.loaderArea}>
      <Loader animated label="Loading Scar Alpha AI" />
    </div>
  );
}
