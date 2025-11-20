'use client';

import { useQuery } from '@tanstack/react-query';
import type React from 'react';
import { createContext, useContext, useEffect, useMemo } from 'react';
import { useAuthMutations } from '@/lib/client/hooks/auth/use-auth';
import { useClassStore } from '@/lib/client/store/class-store';
import { authService } from '@/lib/core/services/auth.service';
import { ApiResponse, UserSuccessResponse } from '@/lib/core/types/api.type';
import { ClientUser } from '@/lib/core/types/user.type';
import { Login, Register } from '@/lib/core/types/auth.type';

export type AuthContextState = {
  user: ClientUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
};

export type AuthContextActions = {
  login: (credentials: Login) => Promise<UserSuccessResponse>;
  isPendingLogin: boolean;
  register: (params: Register) => Promise<UserSuccessResponse>;
  isPendingRegister: boolean;
  logout: () => Promise<ApiResponse<void>>;
  isPendingLogout: boolean;
  updateUser: (updates: Partial<ClientUser>) => Promise<UserSuccessResponse>;
  isPendingUpdateUser: boolean;
};

const AuthStateContext = createContext<AuthContextState | undefined>(undefined);
const AuthActionsContext = createContext<AuthContextActions | undefined>(
  undefined,
);

export function useAuthState() {
  const context = useContext(AuthStateContext);
  if (!context)
    throw new Error('useAuthState deve ser usado dentro de <AuthProvider>');
  return context;
}

export function useAuthActions() {
  const context = useContext(AuthActionsContext);
  if (!context)
    throw new Error('useAuthActions deve ser usado dentro de <AuthProvider>');
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: user, isLoading: isAuthLoading } = useQuery({
    queryKey: ['me'],
    queryFn: authService.getMe,
    retry: 0,
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5,
  });

  const mutations = useAuthMutations();

  const { selectedClassId, selectClass, _hasHydrated } = useClassStore();
  useEffect(() => {
    if (_hasHydrated && user && selectedClassId) {
      if (!useClassStore.getState().classInfo) {
        selectClass(selectedClassId, user.id);
      }
    }
  }, [_hasHydrated, user, selectedClassId, selectClass]);

  const stateValue = useMemo<AuthContextState>(
    () => ({
      user: user ?? null,
      isAuthenticated: !!user,
      isLoading: isAuthLoading,
    }),
    [user, isAuthLoading],
  );

  const actionsValue = useMemo<AuthContextActions>(
    () => ({
      login: mutations.login,
      isPendingLogin: mutations.isPendingLogin,
      register: mutations.register,
      isPendingRegister: mutations.isPendingRegister,
      logout: mutations.logout,
      isPendingLogout: mutations.isPendingLogout,
      updateUser: mutations.updateUser,
      isPendingUpdateUser: mutations.isPendingUpdateUser,
    }),
    [mutations],
  );

  return (
    <AuthStateContext.Provider value={stateValue}>
      <AuthActionsContext.Provider value={actionsValue}>
        {children}
      </AuthActionsContext.Provider>
    </AuthStateContext.Provider>
  );
}
