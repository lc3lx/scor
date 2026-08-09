import { DASHBOARD_CONTENT, DASHBOARD_INITIAL_TIMEFRAME } from './dashboard.mock';
import type { DashboardContent, DashboardTimeframe } from '../types';
import { accountApi, binollaApi, meApi, tradesApi } from '@shared/api';

function formatMoney(value: number): string {
  return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function abbr(asset: string): string {
  return asset.slice(0, 2).toUpperCase();
}

export const dashboardService = {
  async fetchContent(): Promise<DashboardContent> {
    const content = structuredClone(DASHBOARD_CONTENT);

    try {
      const [me, status, balance, trades] = await Promise.all([
        meApi.get().catch(() => null),
        accountApi.status().catch(() => null),
        binollaApi.balance().catch(() => null),
        tradesApi.list({ page: 1, pageSize: 5 }).catch(() => null),
      ]);

      content.userName = me?.fullName?.trim() || me?.username?.trim() || 'Trader';
      content.balance.value = balance ? formatMoney(balance.currentBalance) : '—';
      content.balance.growth = status ? `Access: ${status.botAccess}` : '—';
      content.balance.growthSuffix =
        status?.botAccess === 'AdminApprovalRequired'
          ? 'waiting for administrator approval'
          : status?.adminApproved
            ? 'admin approved · free access'
            : `approval: ${status?.approvalStatus ?? '—'}`;
      content.balance.statusLabel =
        status?.botAccess === 'Allowed'
          ? 'ACTIVE'
          : status?.botAccess === 'AdminApprovalRequired'
            ? 'PENDING'
            : 'BLOCKED';

      // Do not invent P/L — clear mock aggregates.
      content.balance.todayProfitValue = '—';
      content.balance.todayLossValue = '—';
      content.balance.netTodayValue = '—';
      content.stats = content.stats.map((stat) => ({
        ...stat,
        value: '—',
        secondary: 'From server trades only',
      }));
      content.performance.value = '—';

      if (trades) {
        content.markets = trades.items.map((t) => ({
          id: t.id,
          pair: t.asset,
          abbr: abbr(t.asset),
          subtitle: `${t.direction} · ${t.status} · ${new Date(t.createdAt).toLocaleTimeString('en-GB', { hour12: false })}`,
          result:
            t.pnl === null || t.pnl === undefined
              ? t.status
              : `${t.pnl >= 0 ? '+' : ''}$${t.pnl.toFixed(2)}`,
          resultTone:
            t.pnl !== null && t.pnl > 0
              ? ('success' as const)
              : t.pnl !== null && t.pnl < 0
                ? ('danger' as const)
                : ('primary' as const),
          stake: `$${t.amount}`,
        }));
        content.stats = content.stats.map((stat) =>
          stat.id === 'total-trades'
            ? { ...stat, value: String(trades.total), secondary: 'All time' }
            : stat,
        );
      } else {
        content.markets = [];
      }
    } catch {
      content.balance.value = '—';
      content.markets = [];
    }

    return content;
  },

  getInitialTimeframe(): DashboardTimeframe {
    return DASHBOARD_INITIAL_TIMEFRAME;
  },
};

export type DashboardService = typeof dashboardService;
