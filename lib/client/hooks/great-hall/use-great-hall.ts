'use client';

import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { jsonFetch } from '@/lib/core/utils/api';
import type { SocialPost } from '@/lib/core/types/social.type';
import type { ForumPost } from '@/lib/core/types/forum.type';
import type {
  ClientUser,
  EnrichedUserRanking,
} from '@/lib/core/types/user.type';
import type { HouseStats } from '@/lib/core/types/house.type';
import { useEffect } from 'react';

export type GreatHallData = {
  socialPosts: SocialPost[];
  forumPosts: ForumPost[];
  studentRanking: EnrichedUserRanking[];
  houseStats: HouseStats[];
};

export type OnlineUser = Pick<ClientUser, 'id' | 'house'> & {
  name: string;
  avatar: string;
  status: string;
};

const greatHallKeys = {
  allData: (classId: string) => ['greatHallData', classId] as const,
  onlineUsers: (classId: string) => ['onlineUsers', classId] as const,
};

export function useGreatHall(classId?: string) {
  const {
    data: greatHallData,
    status,
    error: greatHallError,
    refetch,
  } = useQuery<GreatHallData, Error>({
    queryKey: greatHallKeys.allData(classId || ''),
    queryFn: async () => {
      if (!classId) {
        throw new Error('Class ID is required');
      }
      const [socialPosts, forumPosts, studentRanking, houseStats] =
        await Promise.all([
          jsonFetch<SocialPost[]>(`/api/social?classId=${classId}`),
          jsonFetch<ForumPost[]>(`/api/forum?classId=${classId}`),
          jsonFetch<EnrichedUserRanking[]>(
            `/api/users/ranking?classId=${classId}`,
          ),
          jsonFetch<HouseStats[]>(`/api/houses/ranking?classId=${classId}`),
        ]);
      return { socialPosts, forumPosts, studentRanking, houseStats };
    },
    enabled: !!classId,
    staleTime: 1000 * 60 * 3,
  });

  useEffect(() => {
    if (greatHallError) {
      toast.error('Falha ao carregar dados do Salão Principal', {
        description: 'Por favor, tente recarregar a página.',
      });
    }
  }, [greatHallError]);

  const { data: onlineUsers, error: onlineUsersError } = useQuery<
    OnlineUser[],
    Error
  >({
    queryKey: greatHallKeys.onlineUsers(classId || ''),
    queryFn: () =>
      jsonFetch<OnlineUser[]>(`/api/users/online?classId=${classId}`),
    enabled: !!classId,
    refetchInterval: 30_000,
    refetchOnWindowFocus: true,
    staleTime: 20_000,
  });

  useEffect(() => {
    if (onlineUsersError) {
      console.warn('Falha ao buscar usuários online.');
    }
  }, [onlineUsersError]);

  return {
    data: greatHallData,
    status,
    error: greatHallError?.message || null,
    onlineUsers: onlineUsers ?? [],
    refetch,
  };
}

