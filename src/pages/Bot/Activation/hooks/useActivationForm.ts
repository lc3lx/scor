import { useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@constants/routes';
import { accountApi } from '@shared/api';
import {
  useAuthForm,
  validateActivationForm,
  type ActivationFormValues,
} from '@features/Auth';
import { ACTIVATION_INITIAL_VALUES } from '../data/activation.mock';

/**
 * Activation keys are obsolete. Redirect users to account status.
 */
export function useActivationForm() {
  const navigate = useNavigate();

  useEffect(() => {
    void accountApi
      .status()
      .then((status) => {
        navigate(status.botAccess === 'Allowed' ? ROUTES.home : ROUTES.settings, { replace: true });
      })
      .catch(() => {
        navigate(ROUTES.login, { replace: true });
      });
  }, [navigate]);

  const handleSubmit = useCallback(async (_values: ActivationFormValues) => {
    const status = await accountApi.status();
    navigate(status.botAccess === 'Allowed' ? ROUTES.home : ROUTES.settings);
  }, [navigate]);

  const form = useAuthForm<ActivationFormValues>({
    initialValues: { ...ACTIVATION_INITIAL_VALUES },
    validate: validateActivationForm,
    onSubmit: handleSubmit,
  });

  const enterApp = useCallback(() => {
    navigate(ROUTES.settings);
  }, [navigate]);

  return {
    ...form,
    showSuccess: false,
    enterApp,
  };
}
