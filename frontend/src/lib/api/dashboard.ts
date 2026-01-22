import { apiClient } from '../api-client';
import type { DashboardStats } from '@/types';

export const dashboardApi = {
  /**
   * 대시보드 통계 조회
   */
  getStats: async (): Promise<DashboardStats> => {
    return apiClient.get('/api/dashboard/stats');
  },
};
