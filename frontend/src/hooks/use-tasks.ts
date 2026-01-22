import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { taskApi } from '@/lib/api/task';
import type { Task, TaskCreateRequest, TaskUpdateRequest } from '@/types';

const TASK_KEYS = {
  all: ['tasks'] as const,
  lists: () => [...TASK_KEYS.all, 'list'] as const,
  list: (filters: string) => [...TASK_KEYS.lists(), { filters }] as const,
  details: () => [...TASK_KEYS.all, 'detail'] as const,
  detail: (id: number) => [...TASK_KEYS.details(), id] as const,
  today: () => [...TASK_KEYS.all, 'today'] as const,
  week: () => [...TASK_KEYS.all, 'week'] as const,
  overdue: () => [...TASK_KEYS.all, 'overdue'] as const,
};

/**
 * 전체 할 일 목록 조회
 */
export const useTasks = () => {
  return useQuery({
    queryKey: TASK_KEYS.lists(),
    queryFn: taskApi.getAll,
  });
};

/**
 * 할 일 상세 조회
 */
export const useTask = (id: number) => {
  return useQuery({
    queryKey: TASK_KEYS.detail(id),
    queryFn: () => taskApi.getById(id),
    enabled: !!id,
  });
};

/**
 * 오늘 할 일 조회
 */
export const useTodayTasks = () => {
  return useQuery({
    queryKey: TASK_KEYS.today(),
    queryFn: taskApi.getToday,
  });
};

/**
 * 이번 주 할 일 조회
 */
export const useWeekTasks = () => {
  return useQuery({
    queryKey: TASK_KEYS.week(),
    queryFn: taskApi.getThisWeek,
  });
};

/**
 * 지난 할 일 조회
 */
export const useOverdueTasks = () => {
  return useQuery({
    queryKey: TASK_KEYS.overdue(),
    queryFn: taskApi.getOverdue,
  });
};

/**
 * 할 일 생성
 */
export const useCreateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: TaskCreateRequest) => taskApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TASK_KEYS.all });
    },
  });
};

/**
 * 할 일 수정
 */
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

/**
 * 할 일 삭제
 */
export const useDeleteTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => taskApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TASK_KEYS.all });
    },
  });
};

/**
 * 할 일 완료 토글
 */
export const useToggleTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => taskApi.toggleComplete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TASK_KEYS.all });
    },
  });
};
