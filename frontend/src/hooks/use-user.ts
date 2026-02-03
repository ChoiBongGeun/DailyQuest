import { useMutation } from '@tanstack/react-query';
import { authApi } from '@/lib/api/auth';

export function useUpdateNickname() {
  return useMutation({
    mutationFn: (nickname: string) => authApi.updateNickname(nickname),
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (data: { currentPassword: string; newPassword: string }) =>
      authApi.changePassword(data),
  });
}

export function useDeleteAccount() {
  return useMutation({
    mutationFn: (password: string) => authApi.deleteAccount(password),
  });
}
