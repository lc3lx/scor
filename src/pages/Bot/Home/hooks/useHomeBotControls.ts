import { useCallback } from 'react';
import type { UseHomeDataReturn } from './useHomeData';

export function useHomeBotControls(homeData: UseHomeDataReturn) {
  const { data, updateRuntime } = homeData;

  const handleStart = useCallback(async () => {
    await updateRuntime({ botStatus: 'running' });
  }, [updateRuntime]);

  const handlePause = useCallback(async () => {
    await updateRuntime({ botStatus: 'paused' });
  }, [updateRuntime]);

  const handleStop = useCallback(async () => {
    await updateRuntime({ botStatus: 'stopped' });
  }, [updateRuntime]);

  const handleApply = useCallback(async () => {
    if (!data) return;
    await updateRuntime({ botStatus: data.runtime.botStatus });
  }, [data, updateRuntime]);

  const isStartPressed = data?.runtime.botStatus === 'running';

  return {
    isStartPressed,
    handleStart,
    handlePause,
    handleStop,
    handleApply,
  };
}

export type UseHomeBotControlsReturn = ReturnType<typeof useHomeBotControls>;
