import type { UseHomeDataReturn } from './useHomeData';
import { useState } from 'react';
import { ApiClientError } from '@shared/api';
import { useT } from '@shared/i18n';

type ControlFeedback = {
  tone: 'success' | 'danger' | 'warning';
  message: string;
};

/** Bot execution starts only after the user presses Start. */
export function useHomeBotControls(homeData: UseHomeDataReturn) {
  const t = useT();
  const [isUpdating, setIsUpdating] = useState(false);
  const [feedback, setFeedback] = useState<ControlFeedback | null>(null);
  const setStatus = async (botStatus: 'running' | 'paused' | 'stopped') => {
    if (isUpdating) return;
    if (botStatus === 'running' && !homeData.data?.runtime.tradingPairId) {
      setFeedback({ tone: 'warning', message: t('home.controls.selectPair') });
      return;
    }
    setIsUpdating(true);
    try {
      await homeData.updateRuntime({ botStatus });
      homeData.refresh();
      setFeedback({
        tone: 'success',
        message:
          botStatus === 'running'
            ? t('home.controls.started')
            : botStatus === 'paused'
              ? t('home.controls.paused')
              : t('home.controls.stopped'),
      });
    } catch (error) {
      setFeedback({
        tone: 'danger',
        message: error instanceof ApiClientError ? error.message : t('common.errorGeneric'),
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return {
    handleStart: () => setStatus('running'),
    handlePause: () => setStatus('paused'),
    handleStop: () => setStatus('stopped'),
    handleApply: async () => {
      if (!homeData.data) return;
      if (isUpdating) return;
      setIsUpdating(true);
      try {
        await homeData.updateRuntime({ settings: homeData.data.runtime.settings });
        homeData.refresh();
        setFeedback({ tone: 'success', message: t('home.controls.saved') });
      } catch (error) {
        setFeedback({
          tone: 'danger',
          message: error instanceof ApiClientError ? error.message : t('common.errorGeneric'),
        });
      } finally {
        setIsUpdating(false);
      }
    },
    isStartPressed: homeData.data?.runtime.botStatus === 'running',
    isUpdating,
    feedback,
  };
}
