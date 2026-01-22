import { apiClient } from '../api-client';
import type { Project, ProjectCreateRequest, ProjectUpdateRequest } from '@/types';

export const projectApi = {
  /**
   * 전체 프로젝트 목록 조회
   */
  getAll: async (): Promise<Project[]> => {
    return apiClient.get('/api/projects');
  },

  /**
   * 프로젝트 상세 조회
   */
  getById: async (id: number): Promise<Project> => {
    return apiClient.get(`/api/projects/${id}`);
  },

  /**
   * 프로젝트 생성
   */
  create: async (data: ProjectCreateRequest): Promise<Project> => {
    return apiClient.post('/api/projects', data);
  },

  /**
   * 프로젝트 수정
   */
  update: async (id: number, data: ProjectUpdateRequest): Promise<Project> => {
    return apiClient.put(`/api/projects/${id}`, data);
  },

  /**
   * 프로젝트 삭제
   */
  delete: async (id: number): Promise<void> => {
    return apiClient.delete(`/api/projects/${id}`);
  },

  /**
   * 프로젝트 통계 조회
   */
  getStats: async (id: number): Promise<{
    totalTasks: number;
    completedTasks: number;
    completionRate: number;
  }> => {
    return apiClient.get(`/api/projects/${id}/stats`);
  },
};
