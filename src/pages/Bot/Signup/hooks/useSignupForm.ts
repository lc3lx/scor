import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@constants/routes';
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
      await authService.signup(values);
      navigate(ROUTES.activation);
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
