import { apiClient } from '../api-client';
import type { LoginRequest, SignupRequest, AuthResponse, User } from '@/types';

export const authApi = {
  /**
   * 로그인
   */
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    return apiClient.post('/api/users/login', data);
  },

  /**
   * 회원가입
   */
  signup: async (data: SignupRequest): Promise<AuthResponse> => {
    return apiClient.post('/api/users/signup', data);
  },

  /**
   * 내 정보 조회
   */
  getMe: async (): Promise<User> => {
    return apiClient.get('/api/users/me');
  },

  /**
   * 비밀번호 변경
   */
  changePassword: async (currentPassword: string, newPassword: string): Promise<void> => {
    return apiClient.put('/api/users/password', {
      currentPassword,
      newPassword,
    });
  },

  /**
   * 회원 탈퇴
   */
  deleteAccount: async (): Promise<void> => {
    return apiClient.delete('/api/users/me');
  },
};
