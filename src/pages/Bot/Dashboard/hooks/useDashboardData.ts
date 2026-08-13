import { useCallback, useEffect, useState } from 'react';
import { dashboardService } from '../data/dashboardService';
import type { DashboardContent, DashboardTimeframe } from '../types';

export function useDashboardData() {
  const [data, setData] = useState<DashboardContent | null>(null);
  const [timeframe, setTimeframe] = useState<DashboardTimeframe>(
    dashboardService.getInitialTimeframe(),
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;

    void (async () => {
      const content = await dashboardService.fetchContent(timeframe);
      if (!active) return;
      setData(content);
      setIsLoading(false);
    })();

    return () => {
      active = false;
    };
    // Initial load only — timeframe switches recompute locally from tradeSnapshot.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectTimeframe = useCallback((next: DashboardTimeframe) => {
    setTimeframe(next);
    setData((current) =>
      current ? dashboardService.performanceForTimeframe(current, next) : current,
    );
  }, []);

  return { data, isLoading, timeframe, selectTimeframe };
}
