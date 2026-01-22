import { apiClient } from '../api-client';
import type { Task, TaskCreateRequest, TaskUpdateRequest } from '@/types';

export const taskApi = {
  /**
   * 전체 할 일 목록 조회
   */
  getAll: async (): Promise<Task[]> => {
    return apiClient.get('/api/tasks');
  },

  /**
   * 할 일 상세 조회
   */
  getById: async (id: number): Promise<Task> => {
    return apiClient.get(`/api/tasks/${id}`);
  },

  /**
   * 할 일 생성
   */
  create: async (data: TaskCreateRequest): Promise<Task> => {
    return apiClient.post('/api/tasks', data);
  },

  /**
   * 할 일 수정
   */
  update: async (id: number, data: TaskUpdateRequest): Promise<Task> => {
    return apiClient.put(`/api/tasks/${id}`, data);
  },

  /**
   * 할 일 삭제
   */
  delete: async (id: number): Promise<void> => {
    return apiClient.delete(`/api/tasks/${id}`);
  },

  /**
   * 할 일 완료 토글
   */
  toggleComplete: async (id: number): Promise<Task> => {
    return apiClient.patch(`/api/tasks/${id}/complete`);
  },

  /**
   * 오늘 할 일 조회
   */
  getToday: async (): Promise<Task[]> => {
    return apiClient.get('/api/tasks/today');
  },

  /**
   * 이번 주 할 일 조회
   */
  getThisWeek: async (): Promise<Task[]> => {
    return apiClient.get('/api/tasks/week');
  },

  /**
   * 지난 할 일 조회
   */
  getOverdue: async (): Promise<Task[]> => {
    return apiClient.get('/api/tasks/overdue');
  },

  /**
   * 프로젝트별 할 일 조회
   */
  getByProject: async (projectId: number): Promise<Task[]> => {
    return apiClient.get(`/api/tasks/project/${projectId}`);
  },

  /**
   * 우선순위별 할 일 조회
   */
  getByPriority: async (priority: string): Promise<Task[]> => {
    return apiClient.get(`/api/tasks/priority/${priority}`);
  },
};
