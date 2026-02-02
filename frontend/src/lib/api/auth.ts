import axiosInstance from '../api-client';
import type { LoginRequest, SignupRequest, AuthResponse, User } from '@/types';
import { unwrapApiResponse } from './response';

interface LoginApiResponse {
  id: number;
  email: string;
  nickname: string;
  accessToken: string;
}

export const authApi = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await axiosInstance.post('/api/users/login', data);
    const loginData = unwrapApiResponse<LoginApiResponse>(response);

    return {
      accessToken: loginData.accessToken,
      user: {
        id: loginData.id,
        email: loginData.email,
        nickname: loginData.nickname,
      },
    };
  },

  signup: async (data: SignupRequest): Promise<void> => {
    const response = await axiosInstance.post('/api/users/signup', data);
    unwrapApiResponse(response);
  },

  getMe: async (): Promise<User> => {
    const response = await axiosInstance.get('/api/users/me');
    return unwrapApiResponse<User>(response);
  },

  changePassword: async (data: { currentPassword: string; newPassword: string }): Promise<void> => {
    const response = await axiosInstance.patch('/api/users/me/password', data);
    unwrapApiResponse(response);
  },

  deleteAccount: async (password: string): Promise<void> => {
    const response = await axiosInstance.delete('/api/users/me', {
      params: { password },
    });
    unwrapApiResponse(response);
  },
};
