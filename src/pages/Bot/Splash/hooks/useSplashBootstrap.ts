import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@constants/routes';

const SPLASH_REDIRECT_DELAY_MS = 2000;

export function useSplashBootstrap() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = window.setTimeout(() => {
      navigate(ROUTES.home, { replace: true });
    }, SPLASH_REDIRECT_DELAY_MS);

    return () => window.clearTimeout(timer);
  }, [navigate]);
}
