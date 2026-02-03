import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { taskApi } from '@/lib/api/task';
import type { TaskCreateRequest, TaskUpdateRequest } from '@/types';

const TASK_KEYS = {
  all: ['tasks'] as const,
  lists: () => [...TASK_KEYS.all, 'list'] as const,
  detail: (id: number) => [...TASK_KEYS.all, 'detail', id] as const,
  today: () => [...TASK_KEYS.all, 'today'] as const,
  week: () => [...TASK_KEYS.all, 'week'] as const,
  overdue: () => [...TASK_KEYS.all, 'overdue'] as const,
  byProject: (projectId: number) => [...TASK_KEYS.all, 'project', projectId] as const,
};

export const useTasks = () =>
  useQuery({
    queryKey: TASK_KEYS.lists(),
    queryFn: taskApi.getAll,
  });

export const useTask = (id: number) =>
  useQuery({
    queryKey: TASK_KEYS.detail(id),
    queryFn: () => taskApi.getById(id),
    enabled: !!id,
  });

export const useTodayTasks = () =>
  useQuery({
    queryKey: TASK_KEYS.today(),
    queryFn: taskApi.getToday,
  });

export const useWeekTasks = () =>
  useQuery({
    queryKey: TASK_KEYS.week(),
    queryFn: taskApi.getThisWeek,
  });

export const useOverdueTasks = () =>
  useQuery({
    queryKey: TASK_KEYS.overdue(),
    queryFn: taskApi.getOverdue,
  });

export const useTasksByProject = (projectId?: number) =>
  useQuery({
    queryKey: TASK_KEYS.byProject(projectId || 0),
    queryFn: () => taskApi.getByProject(projectId as number),
    enabled: !!projectId,
  });

export const useCreateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: TaskCreateRequest) => taskApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TASK_KEYS.all });
    },
  });
};

export const useUpdateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: TaskUpdateRequest }) =>
      taskApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TASK_KEYS.all });
    },
  });
};

export const useDeleteTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => taskApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TASK_KEYS.all });
    },
  });
};

export const useSetTaskComplete = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, isCompleted }: { id: number; isCompleted: boolean }) =>
      taskApi.setComplete(id, isCompleted),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TASK_KEYS.all });
    },
  });
};
