import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '@/lib/api/dashboard';

const DASHBOARD_KEYS = {
  all: ['dashboard'] as const,
  stats: () => [...DASHBOARD_KEYS.all, 'stats'] as const,
};

/**
 * 대시보드 통계 조회
 */
export const useDashboardStats = () => {
  return useQuery({
    queryKey: DASHBOARD_KEYS.stats(),
    queryFn: dashboardApi.getStats,
    refetchInterval: 30000, // 30초마다 자동 갱신
  });
};
