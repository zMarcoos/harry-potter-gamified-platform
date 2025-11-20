'use client';

import { useState, useMemo, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { jsonFetch } from '@/lib/core/utils/api';
import type { EnrichedForumPost } from '@/lib/core/types/forum.type';
import type { ClientUser } from '@/lib/core/types/user.type';

const forumKeys = {
  posts: (classId: string) => ['forumPosts', classId] as const,
};

export function useForum(classId: string, currentUser: ClientUser | null) {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');

  const {
    data: posts,
    isLoading,
    error,
    refetch,
  } = useQuery<EnrichedForumPost[], Error>({
    queryKey: forumKeys.posts(classId),
    queryFn: () =>
      jsonFetch<EnrichedForumPost[]>(`/api/forum?classId=${classId}`),
    enabled: !!classId && !!currentUser,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });

  useEffect(() => {
    if (error) {
      toast.error('Não foi possível carregar as perguntas do fórum.');
    }
  }, [error]);

  const filteredAndSortedPosts = useMemo(() => {
    const sorted = [...(posts || [])].sort((a, b) => {
      if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    if (!searchTerm.trim()) return sorted;

    const lowercasedSearchTerm = searchTerm.toLowerCase();
    return sorted.filter(
      (post) =>
        post.title.toLowerCase().includes(lowercasedSearchTerm) ||
        post.content.toLowerCase().includes(lowercasedSearchTerm),
    );
  }, [posts, searchTerm]);

  const deletePostMutation = useMutation({
    mutationFn: (postId: string) =>
      jsonFetch(`/api/forum/${postId}?classId=${classId}`, {
        method: 'DELETE',
      }),
    onMutate: async (postId: string) => {
      await queryClient.cancelQueries({ queryKey: forumKeys.posts(classId) });
      const previousPosts =
        queryClient.getQueryData<EnrichedForumPost[]>(
          forumKeys.posts(classId),
        ) || [];
      queryClient.setQueryData(
        forumKeys.posts(classId),
        previousPosts.filter((p) => p.id !== postId),
      );
      return { previousPosts };
    },
    onSuccess: () => {
      toast.success('Pergunta removida com sucesso.');
    },
    onError: (err, postId, context) => {
      toast.error('Falha ao remover a pergunta.');
      if (context?.previousPosts) {
        queryClient.setQueryData(
          forumKeys.posts(classId),
          context.previousPosts,
        );
      }
    },
  });

  const incrementViewMutation = useMutation({
    mutationFn: (postId: string) =>
      jsonFetch(`/api/forum/${postId}/view`, {
        method: 'POST',
        body: JSON.stringify({ classId }),
      }),
    onMutate: async (postId: string) => {
      queryClient.setQueryData(
        forumKeys.posts(classId),
        (oldPosts: EnrichedForumPost[] | undefined) =>
          oldPosts?.map((p) =>
            p.id === postId ? { ...p, views: (p.views || 0) + 1 } : p,
          ) || [],
      );
    },
    onError: (err, postId) => {
      console.warn(`Falha ao registrar visualização para o post ${postId}`);
    },
  });

  return {
    filteredPosts: filteredAndSortedPosts,
    isLoading,
    searchTerm,
    setSearchTerm,
    deletePost: deletePostMutation.mutateAsync,
    isDeletingPost: deletePostMutation.isPending,
    incrementView: incrementViewMutation.mutate,
    refetch,
  };
}
