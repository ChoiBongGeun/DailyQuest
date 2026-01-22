import axios, { AxiosError, AxiosResponse } from 'axios';
import { useAuthStore } from '@/stores/auth-store';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request Interceptor - JWT 토큰 추가
apiClient.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor - 백엔드 응답 구조 처리
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // 백엔드가 { success: true, data: {...}, message: "..." } 구조를 반환한다고 가정
    // 실제 data 부분만 반환
    if (response.data && typeof response.data === 'object') {
      return response.data.data !== undefined ? response.data.data : response.data;
    }
    return response.data;
  },
  (error: AxiosError<any>) => {
    // 401 Unauthorized - 로그아웃 처리
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }

    // 에러 메시지 추출
    const errorMessage =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      '알 수 없는 오류가 발생했습니다.';

    return Promise.reject(new Error(errorMessage));
  }
);
