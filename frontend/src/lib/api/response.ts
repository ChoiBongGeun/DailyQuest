import type { AxiosResponse } from 'axios';
import type { ApiResponse } from '@/types';

export function unwrapApiResponse<T>(response: AxiosResponse<ApiResponse<T>>): T {
  const payload = response.data;

  if (!payload?.success) {
    throw new Error(payload?.message || '요청 처리에 실패했습니다.');
  }

  return payload.data;
}

export function extractErrorMessage(error: unknown, fallback: string): string {
  if (typeof error !== 'object' || !error) return fallback;

  const axiosError = error as {
    response?: {
      data?: {
        message?: string;
      };
    };
    message?: string;
  };

  return axiosError.response?.data?.message || axiosError.message || fallback;
}
