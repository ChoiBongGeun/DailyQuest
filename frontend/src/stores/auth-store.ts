import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authApi } from '@/lib/api/auth';
import type { User, LoginRequest, SignupRequest } from '@/types';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (email: string, password: string) => Promise<void>;
  signup: (data: SignupRequest) => Promise<void>;
  logout: () => void;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isLoading: false,
      error: null,

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authApi.login({ email, password });
          set({
            user: response.user,
            token: response.accessToken,
            isLoading: false,
          });
        } catch (error: any) {
          set({
            error: error.message || '로그인에 실패했습니다.',
            isLoading: false,
          });
          throw error;
        }
      },

      signup: async (data: SignupRequest) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authApi.signup(data);
          set({
            user: response.user,
            token: response.accessToken,
            isLoading: false,
          });
        } catch (error: any) {
          set({
            error: error.message || '회원가입에 실패했습니다.',
            isLoading: false,
          });
          throw error;
        }
      },

      logout: () => {
        set({
          user: null,
          token: null,
          error: null,
        });
      },

      setUser: (user) => set({ user }),
      setToken: (token) => set({ token }),
      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
      }),
    }
  )
);
