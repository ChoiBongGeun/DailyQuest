import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { authApi } from '@/lib/api/auth';
import type { User, SignupRequest } from '@/types';

interface AuthState {
    user: User | null;
    token: string | null;
    tokenExpiry: number | null;
    isLoading: boolean;

    login: (email: string, password: string) => Promise<void>;
    signup: (data: SignupRequest) => Promise<void>;
    logout: () => void;
    checkTokenExpiry: () => boolean;
    updateUser: (updates: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            user: null,
            token: null,
            tokenExpiry: null,
            isLoading: false,

            login: async (email: string, password: string) => {
                set({ isLoading: true });
                try {
                    const response = await authApi.login({ email, password });
                    const expiry = getTokenExpiry(response.accessToken);

                    set({
                        user: response.user,
                        token: response.accessToken,
                        tokenExpiry: expiry,
                        isLoading: false,
                    });
                } catch (error) {
                    set({ isLoading: false });
                    throw error;
                }
            },

            signup: async (data: SignupRequest) => {
                set({ isLoading: true });
                try {
                    await authApi.signup(data);
                    set({ isLoading: false });
                } catch (error) {
                    set({ isLoading: false });
                    throw error;
                }
            },

            logout: () => {
                set({
                    user: null,
                    token: null,
                    tokenExpiry: null,
                });
            },

            checkTokenExpiry: () => {
                const { tokenExpiry, token } = get();

                if (!token || !tokenExpiry) return false;

                const isExpired = Date.now() > tokenExpiry;

                if (isExpired) {
                    get().logout();
                    return false;
                }

                return true;
            },

            updateUser: (updates: Partial<User>) => {
                set((state) => ({
                    user: state.user ? { ...state.user, ...updates } : null,
                }));
            },
        }),
        {
            name: 'auth-storage',
            storage: createJSONStorage(() => localStorage),
        }
    )
);

function getTokenExpiry(token: string): number {
    const tokenParts = token.split('.');
    if (tokenParts.length !== 3) {
        return Date.now();
    }

    try {
        const payload = JSON.parse(atob(tokenParts[1]));
        if (typeof payload.exp === 'number') {
            return payload.exp * 1000;
        }
    } catch {
        return Date.now();
    }

    return Date.now();
}
