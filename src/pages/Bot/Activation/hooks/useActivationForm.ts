import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@constants/routes';
import {
  authService,
  useAuthForm,
  validateActivationForm,
  type ActivationFormValues,
} from '@features/Auth';
import { ACTIVATION_INITIAL_VALUES } from '../data/activation.mock';

export function useActivationForm() {
  const navigate = useNavigate();

  const handleSubmit = useCallback(async (values: ActivationFormValues) => {
    await authService.activate(values);
  }, []);

  const form = useAuthForm<ActivationFormValues>({
    initialValues: { ...ACTIVATION_INITIAL_VALUES },
    validate: validateActivationForm,
    onSubmit: handleSubmit,
  });

  const enterApp = useCallback(() => {
    navigate(ROUTES.home);
  }, [navigate]);

  return {
    ...form,
    showSuccess: form.status === 'success',
    enterApp,
  };
}
