import { jsonFetch, jsonRequest } from '@/lib/core/utils/api';
import type { ApiResponse, UserSuccessResponse } from '@/lib/core/types/api.type';
import type { Login, Register } from '@/lib/core/types/auth.type';
import type { ClientUser } from '@/lib/core/types/user.type';

export const authService = {
  getMe: (options?: RequestInit) => {
    return jsonFetch<ClientUser>('/api/auth/me', options);
  },

  checkEmail: (email: string) => {
    return jsonRequest<{ exists: boolean }>(
      '/api/auth/check-email',
      'POST',
      { email },
    );
  },

  login: (credentials: Login) => {
    return jsonRequest<UserSuccessResponse>(
      '/api/auth/login',
      'POST',
      credentials,
    );
  },

  logout: () => {
    return jsonFetch<ApiResponse<void>>('/api/auth/logout', { method: 'POST' });
  },

  register: (params: Register) => {
    return jsonRequest<UserSuccessResponse>(
      '/api/auth/register',
      'POST',
      params,
    );
  },

  updateUser: (updates: Partial<ClientUser>) => {
    return jsonRequest<UserSuccessResponse>(
      '/api/users/update',
      'PUT',
      updates,
    );
  },
};
