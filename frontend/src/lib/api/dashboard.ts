import axiosInstance from '../api-client';
import type { DashboardStats } from '@/types';
import { unwrapApiResponse } from './response';

export const dashboardApi = {
  getStats: async (): Promise<DashboardStats> => {
    const response = await axiosInstance.get('/api/dashboard/stats');
    return unwrapApiResponse<DashboardStats>(response);
  },
};
