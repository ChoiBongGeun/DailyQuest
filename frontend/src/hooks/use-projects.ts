import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectApi } from '@/lib/api/project';
import type { Project, ProjectCreateRequest, ProjectUpdateRequest } from '@/types';

const PROJECT_KEYS = {
  all: ['projects'] as const,
  lists: () => [...PROJECT_KEYS.all, 'list'] as const,
  details: () => [...PROJECT_KEYS.all, 'detail'] as const,
  detail: (id: number) => [...PROJECT_KEYS.details(), id] as const,
  stats: (id: number) => [...PROJECT_KEYS.all, 'stats', id] as const,
};

/**
 * 전체 프로젝트 목록 조회
 */
export const useProjects = () => {
  return useQuery({
    queryKey: PROJECT_KEYS.lists(),
    queryFn: projectApi.getAll,
  });
};

/**
 * 프로젝트 상세 조회
 */
export const useProject = (id: number) => {
  return useQuery({
    queryKey: PROJECT_KEYS.detail(id),
    queryFn: () => projectApi.getById(id),
    enabled: !!id,
  });
};

/**
 * 프로젝트 통계 조회
 */
export const useProjectStats = (id: number) => {
  return useQuery({
    queryKey: PROJECT_KEYS.stats(id),
    queryFn: () => projectApi.getStats(id),
    enabled: !!id,
  });
};

/**
 * 프로젝트 생성
 */
export const useCreateProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ProjectCreateRequest) => projectApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROJECT_KEYS.all });
    },
  });
};

/**
 * 프로젝트 수정
 */
export const useUpdateProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: ProjectUpdateRequest }) =>
      projectApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROJECT_KEYS.all });
    },
  });
};

/**
 * 프로젝트 삭제
 */
export const useDeleteProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => projectApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROJECT_KEYS.all });
    },
  });
};
