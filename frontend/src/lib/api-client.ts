import axios, { AxiosError, AxiosResponse, AxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/stores/auth-store';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

const PUBLIC_URLS = [
    '/api/users/login',
    '/api/users/signup',
    '/api/health',
];

const axiosInstance = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000,
});

axiosInstance.interceptors.request.use(
    (config) => {
        const url = config.url || '';
        const isPublicUrl = PUBLIC_URLS.some(publicUrl => url.includes(publicUrl));

        if (!isPublicUrl) {
            const isTokenValid = useAuthStore.getState().checkTokenExpiry();

            if (!isTokenValid) {
                console.warn('[API Client] Token expired, redirecting to login');
                if (typeof window !== 'undefined') {
                    window.location.href = '/login';
                }
                return Promise.reject(new Error('Token expired'));
            }
        }

        const token = useAuthStore.getState().token;

        if (token && config.headers && !isPublicUrl) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => {
        console.error('[API Client] Request error:', error);
        return Promise.reject(error);
    }
);

axiosInstance.interceptors.response.use(
    (response: AxiosResponse) => {
        return response;
    },
    (error: AxiosError<any>) => {
        console.error('[API Client] Response error:', {
            status: error.response?.status,
            url: error.config?.url,
            message: error.response?.data?.message || error.message,
        });

        if (error.response?.status === 401) {
            console.warn('[API Client] 401 Unauthorized - Logging out');
            useAuthStore.getState().logout();
            if (typeof window !== 'undefined') {
                window.location.href = '/login';
            }
        }

        return Promise.reject(error);
    }
);

export default axiosInstance;
