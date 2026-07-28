import { HOME_INITIAL_RUNTIME, HOME_MOCK_CONTENT } from './home.mock';
import type { HomeData, HomeRuntimeState } from '../types';

let runtimeState: HomeRuntimeState = { ...HOME_INITIAL_RUNTIME, settings: { ...HOME_INITIAL_RUNTIME.settings, toggles: [...HOME_INITIAL_RUNTIME.settings.toggles], riskOptions: [...HOME_INITIAL_RUNTIME.settings.riskOptions] } };

function cloneRuntime(): HomeRuntimeState {
  return {
    ...runtimeState,
    settings: {
      ...runtimeState.settings,
      toggles: runtimeState.settings.toggles.map((toggle) => ({ ...toggle })),
      riskOptions: [...runtimeState.settings.riskOptions],
    },
  };
}

export const homeService = {
  async fetchHomeData(): Promise<HomeData> {
    return {
      ...HOME_MOCK_CONTENT,
      runtime: cloneRuntime(),
    };
  },

  async updateRuntime(partial: Partial<HomeRuntimeState>): Promise<HomeRuntimeState> {
    runtimeState = {
      ...runtimeState,
      ...partial,
      settings: partial.settings
        ? {
            ...runtimeState.settings,
            ...partial.settings,
            toggles: partial.settings.toggles ?? runtimeState.settings.toggles,
            riskOptions: partial.settings.riskOptions ?? runtimeState.settings.riskOptions,
          }
        : runtimeState.settings,
    };

    return cloneRuntime();
  },

  resetRuntime(): void {
    runtimeState = {
      ...HOME_INITIAL_RUNTIME,
      settings: {
        ...HOME_INITIAL_RUNTIME.settings,
        toggles: HOME_INITIAL_RUNTIME.settings.toggles.map((toggle) => ({ ...toggle })),
        riskOptions: [...HOME_INITIAL_RUNTIME.settings.riskOptions],
      },
    };
  },
};
