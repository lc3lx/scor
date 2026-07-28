import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@constants/routes';
import {
  authService,
  useAuthForm,
  validateLoginForm,
  type LoginFormValues,
} from '@features/Auth';
import { LOGIN_INITIAL_VALUES } from '../data/login.mock';

export function useLoginForm() {
  const navigate = useNavigate();

  const handleSubmit = useCallback(
    async (values: LoginFormValues) => {
      await authService.login(values);
      navigate(ROUTES.activation);
    },
    [navigate],
  );

  const form = useAuthForm<LoginFormValues>({
    initialValues: { ...LOGIN_INITIAL_VALUES },
    validate: validateLoginForm,
    onSubmit: handleSubmit,
  });

  const goToSignup = useCallback(() => {
    navigate(ROUTES.signup);
  }, [navigate]);

  const onForgotPassword = useCallback(() => {
    // Reserved for future password-reset flow.
  }, []);

  return {
    ...form,
    goToSignup,
    onForgotPassword,
  };
}
