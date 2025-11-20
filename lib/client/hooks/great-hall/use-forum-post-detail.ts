'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { jsonFetch } from '@/lib/core/utils/api';
import type { EnrichedForumPostReply } from '@/lib/core/types/forum.type';
import type { ClientUser } from '@/lib/core/types/user.type';
import { useEffect } from 'react';

const forumPostDetailKeys = {
  replies: (classId: string, postId: string) =>
    ['forumReplies', classId, postId] as const,
};

export function useForumPostDetail(
  classId: string,
  postId: string,
  currentUser: ClientUser | null,
) {
  const queryClient = useQueryClient();

  const {
    data: replies,
    isLoading,
    error,
    refetch,
  } = useQuery<EnrichedForumPostReply[], Error>({
    queryKey: forumPostDetailKeys.replies(classId, postId),
    queryFn: () =>
      jsonFetch<EnrichedForumPostReply[]>(
        `/api/forum/${postId}/replies?classId=${classId}`,
      ).then((data) =>
        data.sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
        ),
      ),
    enabled: !!classId && !!postId && !!currentUser,
    staleTime: 1000 * 60, // 1 minuto
  });

  useEffect(() => {
    if (error) {
      toast.error('Não foi possível carregar as respostas.');
    }
  }, [error]);

  const addReplyMutation = useMutation({
    mutationFn: ({ content, code }: { content: string; code?: string }) =>
      jsonFetch<EnrichedForumPostReply>(`/api/forum/${postId}/replies`, {
        method: 'POST',
        body: JSON.stringify({
          classId,
          authorId: currentUser!.id,
          content,
          code,
        }),
      }),
    onMutate: async (newReplyData) => {
      await queryClient.cancelQueries({
        queryKey: forumPostDetailKeys.replies(classId, postId),
      });
      const previousReplies =
        queryClient.getQueryData<EnrichedForumPostReply[]>(
          forumPostDetailKeys.replies(classId, postId),
        ) || [];

      const optimisticReply: EnrichedForumPostReply = {
        id: `temp_${Date.now()}`,
        authorId: currentUser!.id,
        content: newReplyData.content,
        code: newReplyData.code,
        createdAt: new Date(),
        likes: [],
        author: {
          name: currentUser!.profile.name,
          avatar: currentUser!.profile.avatar,
        },
      };

      queryClient.setQueryData(
        forumPostDetailKeys.replies(classId, postId),
        [...previousReplies, optimisticReply],
      );
      return { previousReplies, optimisticReplyId: optimisticReply.id };
    },
    onSuccess: (newReplyFromApi, variables, context) => {
      queryClient.setQueryData(
        forumPostDetailKeys.replies(classId, postId),
        (oldReplies: EnrichedForumPostReply[] | undefined) =>
          oldReplies?.map((r) =>
            r.id === context?.optimisticReplyId ? newReplyFromApi : r,
          ) || [],
      );
    },
    onError: (err, newReplyData, context) => {
      toast.error('Falha ao enviar resposta.');
      if (context?.previousReplies) {
        queryClient.setQueryData(
          forumPostDetailKeys.replies(classId, postId),
          context.previousReplies,
        );
      }
    },
  });

  const toggleReplyLikeMutation = useMutation({
    mutationFn: (replyId: string) =>
      jsonFetch(`/api/forum/${postId}/replies/${replyId}/like`, {
        method: 'POST',
        body: JSON.stringify({ classId, userId: currentUser!.id }),
      }),
    onMutate: async (replyId: string) => {
      await queryClient.cancelQueries({
        queryKey: forumPostDetailKeys.replies(classId, postId),
      });
      const previousReplies =
        queryClient.getQueryData<EnrichedForumPostReply[]>(
          forumPostDetailKeys.replies(classId, postId),
        ) || [];

      queryClient.setQueryData(
        forumPostDetailKeys.replies(classId, postId),
        previousReplies.map((r) => {
          if (r.id !== replyId) return r;
          const isLiked = r.likes.includes(currentUser!.id);
          const newLikes = isLiked
            ? r.likes.filter((id) => id !== currentUser!.id)
            : [...r.likes, currentUser!.id];
          return { ...r, likes: newLikes };
        }),
      );
      return { previousReplies };
    },
    onError: (err, replyId, context) => {
      toast.error('Erro ao registrar curtida.');
      if (context?.previousReplies) {
        queryClient.setQueryData(
          forumPostDetailKeys.replies(classId, postId),
          context.previousReplies,
        );
      }
    },
  });

  const deleteReplyMutation = useMutation({
    mutationFn: (replyId: string) =>
      jsonFetch(`/api/forum/${postId}/replies/${replyId}`, {
        method: 'DELETE',
        body: JSON.stringify({ classId, userId: currentUser?.id }),
      }),
    onMutate: async (replyId: string) => {
      await queryClient.cancelQueries({
        queryKey: forumPostDetailKeys.replies(classId, postId),
      });
      const previousReplies =
        queryClient.getQueryData<EnrichedForumPostReply[]>(
          forumPostDetailKeys.replies(classId, postId),
        ) || [];

      queryClient.setQueryData(
        forumPostDetailKeys.replies(classId, postId),
        previousReplies.filter((r) => r.id !== replyId),
      );
      return { previousReplies };
    },
    onSuccess: () => {
      toast.success('Resposta removida.');
    },
    onError: (err, replyId, context) => {
      toast.error('Falha ao remover resposta.');
      if (context?.previousReplies) {
        queryClient.setQueryData(
          forumPostDetailKeys.replies(classId, postId),
          context.previousReplies,
        );
      }
    },
  });

  return {
    replies: replies ?? [],
    isLoading,
    addReply: addReplyMutation.mutateAsync,
    isAddingReply: addReplyMutation.isPending,
    toggleReplyLike: toggleReplyLikeMutation.mutateAsync,
    deleteReply: deleteReplyMutation.mutateAsync,
    isDeletingReply: deleteReplyMutation.isPending,
    refetch,
  };
}
