import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@constants/routes';
import { accountApi } from '@shared/api';
import {
  authService,
  useAuthForm,
  validateSignupForm,
  type SignupFormValues,
} from '@features/Auth';
import { SIGNUP_INITIAL_VALUES } from '../data/signup.mock';

export function useSignupForm() {
  const navigate = useNavigate();

  const handleSubmit = useCallback(
    async (values: SignupFormValues) => {
      await authService.loginWithTelegram();
      // Optional: if user provided Binolla SSID on signup form, link it.
      const ssid = values.binollaAccount?.trim();
      if (ssid) {
        const { binollaApi } = await import('@shared/api');
        await binollaApi.connect({ ssid, accountType: 'Demo' });
      }
      const status = await accountApi.status();
      navigate(status.botAccess === 'Allowed' ? ROUTES.home : ROUTES.settings);
    },
    [navigate],
  );

  const form = useAuthForm<SignupFormValues>({
    initialValues: { ...SIGNUP_INITIAL_VALUES },
    validate: validateSignupForm,
    onSubmit: handleSubmit,
  });

  const goToLogin = useCallback(() => {
    navigate(ROUTES.login);
  }, [navigate]);

  return {
    ...form,
    goToLogin,
  };
}
