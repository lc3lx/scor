import type { UseHomeDataReturn } from './useHomeData';

/** Bot execution starts only after the user presses Start. */
export function useHomeBotControls(homeData: UseHomeDataReturn) {
  const setStatus = async (botStatus: 'running' | 'paused' | 'stopped') => {
    await homeData.updateRuntime({ botStatus });
    homeData.refresh();
  };

  return {
    handleStart: () => setStatus('running'),
    handlePause: () => setStatus('paused'),
    handleStop: () => setStatus('stopped'),
    handleApply: () => homeData.refresh(),
    isStartPressed: homeData.data?.runtime.botStatus === 'running',
  };
}
