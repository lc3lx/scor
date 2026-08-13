import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@constants/routes';
import { accountApi } from '@shared/api';
import { routeForBotAccess } from '@shared/access/botAccess';
import {
  authService,
  useAuthForm,
  validateLoginForm,
  type LoginFormValues,
} from '@features/Auth';
import { t } from '@shared/i18n';
import { LOGIN_INITIAL_VALUES } from '../data/login.mock';

export function useLoginForm() {
  const navigate = useNavigate();
  const [info, setInfo] = useState<string | null>(null);

  const handleSubmit = useCallback(
    async (_values: LoginFormValues) => {
      setInfo(null);
      await authService.loginWithTelegram();
      const status = await accountApi.status();
      navigate(routeForBotAccess(status.botAccess));
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
    setInfo(t('login.forgotInfo'));
  }, []);

  return {
    ...form,
    goToSignup,
    onForgotPassword,
    info,
  };
}
