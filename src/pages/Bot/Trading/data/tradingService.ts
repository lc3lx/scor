import {
  TRADING_INITIAL_RUNTIME,
  TRADING_MOCK_CONTENT,
} from './trading.mock';
import { activityService } from '../../Activity/data/activityService';
import { tradeService } from '@services/trades';
import type { TradingData, TradingRuntimeState } from '../types';
import type { TradeDirection } from '@components/types';

let runtimeState: TradingRuntimeState = { ...TRADING_INITIAL_RUNTIME };

function cloneRuntime(): TradingRuntimeState {
  return { ...runtimeState };
}

export const tradingService = {
  async fetchTradingData(): Promise<TradingData> {
    return {
      ...TRADING_MOCK_CONTENT,
      runtime: cloneRuntime(),
    };
  },

  async updateRuntime(partial: Partial<TradingRuntimeState>): Promise<TradingRuntimeState> {
    runtimeState = { ...runtimeState, ...partial };
    return cloneRuntime();
  },

  async placeTrade(direction: TradeDirection): Promise<string> {
    const amount = Number.parseFloat(runtimeState.amount) || 25;
    const duration =
      TRADING_MOCK_CONTENT.durationOptions.find((option) => option.id === runtimeState.durationId)
        ?.label ?? '1 min';

    const tradeId = await tradeService.placeTrade({
      direction,
      pair: TRADING_MOCK_CONTENT.binollaCard.pairName,
      platform: 'binolla',
      amount,
      durationLabel: duration,
      strategy: 'Alpha Momentum',
      indicator: 'Bollinger',
      source: 'user',
    });

    await activityService.addTradeNotification({
      tradeId,
      description: `$${amount} ${direction.toUpperCase()} on ${TRADING_MOCK_CONTENT.binollaCard.pairName} · ${duration} expiry.`,
    });

    return tradeId;
  },

  async getTradeDetail(tradeId: string) {
    return tradeService.getTradeDetail(tradeId);
  },

  resetRuntime(): void {
    runtimeState = { ...TRADING_INITIAL_RUNTIME };
  },
};
