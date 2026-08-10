import axiosInstance from '../api-client';
import type {
  Project,
  ProjectActivity,
  ProjectCreateRequest,
  ProjectMember,
  ProjectRole,
  ProjectShareRequest,
  ProjectUpdateRequest,
} from '@/types';
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

  getMembers: async (id: number): Promise<ProjectMember[]> => {
    const response = await axiosInstance.get(`/api/projects/${id}/members`);
    return unwrapApiResponse<ProjectMember[]>(response);
  },

  share: async (id: number, data: ProjectShareRequest): Promise<ProjectMember> => {
    const response = await axiosInstance.post(`/api/projects/${id}/members`, data);
    return unwrapApiResponse<ProjectMember>(response);
  },

  updateMemberRole: async (
    projectId: number,
    memberId: number,
    role: Exclude<ProjectRole, 'OWNER'>
  ): Promise<ProjectMember> => {
    const response = await axiosInstance.patch(`/api/projects/${projectId}/members/${memberId}`, { role });
    return unwrapApiResponse<ProjectMember>(response);
  },

  removeMember: async (projectId: number, memberId: number): Promise<void> => {
    const response = await axiosInstance.delete(`/api/projects/${projectId}/members/${memberId}`);
    unwrapApiResponse(response);
  },

  getActivities: async (id: number): Promise<ProjectActivity[]> => {
    const response = await axiosInstance.get(`/api/projects/${id}/activities`);
    return unwrapApiResponse<ProjectActivity[]>(response);
  },
};
