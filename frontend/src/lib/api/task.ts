import axiosInstance from '../api-client';
import type { Task, TaskCreateRequest, TaskUpdateRequest } from '@/types';
import { unwrapApiResponse } from './response';

const mapTask = (task: Task): Task => task;

export const taskApi = {
  getAll: async (): Promise<Task[]> => {
    const response = await axiosInstance.get('/api/tasks');
    return unwrapApiResponse<Task[]>(response).map(mapTask);
  },

  getById: async (id: number): Promise<Task> => {
    const response = await axiosInstance.get(`/api/tasks/${id}`);
    return mapTask(unwrapApiResponse<Task>(response));
  },

  create: async (data: TaskCreateRequest): Promise<Task> => {
    const response = await axiosInstance.post('/api/tasks', data);
    return mapTask(unwrapApiResponse<Task>(response));
  },

  update: async (id: number, data: TaskUpdateRequest): Promise<Task> => {
    const response = await axiosInstance.put(`/api/tasks/${id}`, data);
    return mapTask(unwrapApiResponse<Task>(response));
  },

  delete: async (id: number): Promise<void> => {
    const response = await axiosInstance.delete(`/api/tasks/${id}`);
    unwrapApiResponse(response);
  },

  setComplete: async (id: number, isCompleted: boolean): Promise<Task> => {
    const endpoint = isCompleted ? 'complete' : 'uncomplete';
    const response = await axiosInstance.patch(`/api/tasks/${id}/${endpoint}`);
    return mapTask(unwrapApiResponse<Task>(response));
  },

  getToday: async (): Promise<Task[]> => {
    const response = await axiosInstance.get('/api/tasks/today');
    return unwrapApiResponse<Task[]>(response).map(mapTask);
  },

  getThisWeek: async (): Promise<Task[]> => {
    const response = await axiosInstance.get('/api/tasks/week');
    return unwrapApiResponse<Task[]>(response).map(mapTask);
  },

  getOverdue: async (): Promise<Task[]> => {
    const response = await axiosInstance.get('/api/tasks/overdue');
    return unwrapApiResponse<Task[]>(response).map(mapTask);
  },

  getByProject: async (projectId: number): Promise<Task[]> => {
    const response = await axiosInstance.get(`/api/tasks/project/${projectId}`);
    return unwrapApiResponse<Task[]>(response).map(mapTask);
  },

  getByPriority: async (priority: string): Promise<Task[]> => {
    const response = await axiosInstance.get(`/api/tasks/priority/${priority}`);
    return unwrapApiResponse<Task[]>(response).map(mapTask);
  },
};
