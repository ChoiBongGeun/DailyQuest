import axiosInstance from '../api-client';
import type { Project, ProjectCreateRequest, ProjectUpdateRequest } from '@/types';
import { unwrapApiResponse } from './response';

export const projectApi = {
  getAll: async (): Promise<Project[]> => {
    const response = await axiosInstance.get('/api/projects');
    return unwrapApiResponse<Project[]>(response);
  },

  getById: async (id: number): Promise<Project> => {
    const response = await axiosInstance.get(`/api/projects/${id}`);
    return unwrapApiResponse<Project>(response);
  },

  create: async (data: ProjectCreateRequest): Promise<Project> => {
    const response = await axiosInstance.post('/api/projects', data);
    return unwrapApiResponse<Project>(response);
  },

  update: async (id: number, data: ProjectUpdateRequest): Promise<Project> => {
    const response = await axiosInstance.put(`/api/projects/${id}`, data);
    return unwrapApiResponse<Project>(response);
  },

  delete: async (id: number): Promise<void> => {
    const response = await axiosInstance.delete(`/api/projects/${id}`);
    unwrapApiResponse(response);
  },

  getStats: async (id: number): Promise<{
    totalTasks: number;
    completedTasks: number;
    completionRate: number;
  }> => {
    const response = await axiosInstance.get(`/api/projects/${id}/stats`);
    return unwrapApiResponse(response);
  },
};
