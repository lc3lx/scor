import { DASHBOARD_CONTENT, DASHBOARD_INITIAL_TIMEFRAME } from './dashboard.mock';
import type { DashboardContent, DashboardTimeframe } from '../types';

export const dashboardService = {
  async fetchContent(): Promise<DashboardContent> {
    return DASHBOARD_CONTENT;
  },

  getInitialTimeframe(): DashboardTimeframe {
    return DASHBOARD_INITIAL_TIMEFRAME;
  },
};

export type DashboardService = typeof dashboardService;
