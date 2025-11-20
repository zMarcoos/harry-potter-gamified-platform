'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { authService } from '@/lib/core/services/auth.service';
import type { ClientUser } from '@/lib/core/types/user.type';
import { useClassStore } from '@/lib/client/store/class-store';

export function useAuthMutations() {
  const queryClient = useQueryClient();
  const router = useRouter();

  const setAuthUserCache = (user: ClientUser | null) => {
    queryClient.setQueryData(['me'], user);
  };

  const loginMutation = useMutation({
    mutationFn: authService.login,
    onSuccess: ({ user }) => {
      setAuthUserCache(user);
      toast.success(`Bem-vindo de volta, ${user.profile.name}!`);
    },
    onError: (error) => {
      toast.error(error.message || 'Falha no login');
    },
  });

  const registerMutation = useMutation({
    mutationFn: authService.register,
    onSuccess: ({ user }) => {
      setAuthUserCache(user);
      toast.success(`Conta criada com sucesso, ${user.profile.name}!`);
    },
    onError: (error) => {
      toast.error(error.message || 'Falha no registro');
    },
  });

  const logoutMutation = useMutation({
    mutationFn: authService.logout,
    onSettled: () => {
      setAuthUserCache(null);
      useClassStore.getState().clearClass();
      toast.info('Até a próxima aventura!');
      router.push('/login');
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: authService.updateUser,
    onSuccess: ({ user }) => {
      setAuthUserCache(user);
      toast.success('Dados atualizados!');
    },
    onError: (error) => {
      toast.error(error.message || 'Falha ao atualizar dados');
    },
  });

  return {
    login: loginMutation.mutateAsync,
    isPendingLogin: loginMutation.isPending,
    register: registerMutation.mutateAsync,
    isPendingRegister: registerMutation.isPending,
    logout: logoutMutation.mutateAsync,
    isPendingLogout: logoutMutation.isPending,
    updateUser: updateUserMutation.mutateAsync,
    isPendingUpdateUser: updateUserMutation.isPending,
  };
}
