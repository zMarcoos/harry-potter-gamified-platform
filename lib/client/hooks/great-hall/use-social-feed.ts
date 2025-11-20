'use client';

import { useState, useCallback } from 'react';
import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { toast } from 'sonner';
import { jsonFetch } from '@/lib/core/utils/api';
import type {
  EnrichedSocialPost,
  SocialComment,
} from '@/lib/core/types/social.type';
import type { ClientUser } from '@/lib/core/types/user.type';

const socialKeys = {
  posts: (classId: string) => ['socialPosts', classId] as const,
  comments: (classId: string, postId: string) =>
    ['socialComments', classId, postId] as const,
};

export function useSocialFeed(classId: string, currentUser: ClientUser | null) {
  const queryClient = useQueryClient();
  const [viewingCommentsForPostId, setViewingCommentsForPostId] = useState<string | null>(
    null,
  );

  const postsQuery = useQuery<EnrichedSocialPost[]>({
    queryKey: socialKeys.posts(classId),
    queryFn: () =>
      jsonFetch<EnrichedSocialPost[]>(`/api/social?classId=${classId}`),
    enabled: !!classId && !!currentUser,
    staleTime: 1000 * 60 * 2,
  });

  const { data: postsData, isLoading, isError: isPostsError } = postsQuery;

  const commentsQuery = useQuery<
    SocialComment[]
  >({
    queryKey: socialKeys.comments(classId, viewingCommentsForPostId || ''),
    queryFn: () =>
      jsonFetch<SocialComment[]>(
        `/api/social/${viewingCommentsForPostId}/comments?classId=${classId}`,
      ),
    enabled: !!viewingCommentsForPostId,
  });
  const { data: commentsData, isLoading: isCommentsLoading } = commentsQuery;


  const createPostMutation = useMutation({
    mutationFn: (content: string) =>
      jsonFetch<EnrichedSocialPost>('/api/social', {
        method: 'POST',
        body: JSON.stringify({
          classId,
          authorId: currentUser!.id,
          content,
        }),
      }),
    onSuccess: (newPostFromApi) => {
      queryClient.setQueryData(
        socialKeys.posts(classId),
        (oldPosts: EnrichedSocialPost[] | undefined) => [
          newPostFromApi,
          ...(oldPosts || []),
        ],
      );
      toast.success('Post criado com sucesso!');
    },
    onError: () => {
      toast.error('Falha ao criar o post.');
    },
  });

  const toggleLikeMutation = useMutation({
    mutationFn: (postId: string) =>
      jsonFetch(`/api/social/${postId}/like`, {
        method: 'POST',
        body: JSON.stringify({ classId, userId: currentUser!.id }),
      }),
    onMutate: async (postId: string) => {
      await queryClient.cancelQueries({ queryKey: socialKeys.posts(classId) });
      const previousPosts =
        queryClient.getQueryData<EnrichedSocialPost[]>(
          socialKeys.posts(classId),
        ) || [];

      queryClient.setQueryData(
        socialKeys.posts(classId),
        previousPosts.map((p) => {
          if (p.id !== postId) return p;
          const isLiked = p.likes.includes(currentUser!.id);
          const newLikes = isLiked
            ? p.likes.filter((id) => id !== currentUser!.id)
            : [...p.likes, currentUser!.id];
          return { ...p, likes: newLikes };
        }),
      );
      return { previousPosts };
    },
    onError: (err, postId, context) => {
      toast.error('Não foi possível registrar sua curtida.');
      if (context?.previousPosts) {
        queryClient.setQueryData(
          socialKeys.posts(classId),
          context.previousPosts,
        );
      }
    },
  });

  const deletePostMutation = useMutation({
    mutationFn: (postId: string) =>
      jsonFetch(`/api/social/${postId}?classId=${classId}`, {
        method: 'DELETE',
      }),
    onMutate: async (postId: string) => {
      await queryClient.cancelQueries({ queryKey: socialKeys.posts(classId) });
      const previousPosts =
        queryClient.getQueryData<EnrichedSocialPost[]>(
          socialKeys.posts(classId),
        ) || [];

      queryClient.setQueryData(
        socialKeys.posts(classId),
        previousPosts.filter((p) => p.id !== postId),
      );
      return { previousPosts };
    },
    onSuccess: () => {
      toast.success('Post removido.');
    },
    onError: (err, postId, context) => {
      toast.error('Falha ao remover o post.');
      if (context?.previousPosts) {
        queryClient.setQueryData(
          socialKeys.posts(classId),
          context.previousPosts,
        );
      }
    },
  });

  const addCommentMutation = useMutation({
    mutationFn: ({
      postId,
      content,
    }: {
      postId: string;
      content: string;
    }) =>
      jsonFetch<SocialComment>(`/api/social/${postId}/comments`, {
        method: 'POST',
        body: JSON.stringify({
          classId,
          authorId: currentUser!.id,
          content,
        }),
      }),
    onMutate: async (newCommentData) => {
      const { postId } = newCommentData;
      await queryClient.cancelQueries({ queryKey: socialKeys.comments(classId, postId) });
      const previousComments = queryClient.getQueryData<SocialComment[]>(
        socialKeys.comments(classId, postId),
      ) || [];

      const optimisticComment: SocialComment = {
        id: `temp_comment_${Date.now()}`,
        authorId: currentUser!.id,
        content: newCommentData.content,
        timestamp: new Date(),
      };

      queryClient.setQueryData(
        socialKeys.comments(classId, postId),
        [...previousComments, optimisticComment],
      );
      return { previousComments, optimisticCommentId: optimisticComment.id, postId };
    },
    onSuccess: (newCommentFromApi, variables, context) => {
      queryClient.setQueryData(
        socialKeys.comments(classId, context!.postId),
        (oldComments: SocialComment[] | undefined) =>
          oldComments?.map(c => c.id === context?.optimisticCommentId ? newCommentFromApi : c) || []
      );
      queryClient.invalidateQueries({ queryKey: socialKeys.posts(classId) });
    },
    onError: (err, newCommentData, context) => {
      toast.error('Falha ao enviar comentário.');
      if (context?.previousComments) {
        queryClient.setQueryData(
          socialKeys.comments(classId, context.postId),
          context.previousComments,
        );
      }
    },
  });

  const deleteCommentMutation = useMutation({
    mutationFn: ({
      postId,
      commentId,
    }: {
      postId: string;
      commentId: string;
    }) =>
      jsonFetch(
        `/api/social/${postId}/comments/${commentId}?classId=${classId}`,
        {
          method: 'DELETE',
        },
      ),
    onMutate: async ({ postId, commentId }) => {
      await queryClient.cancelQueries({ queryKey: socialKeys.comments(classId, postId) });
      const previousComments = queryClient.getQueryData<SocialComment[]>(
        socialKeys.comments(classId, postId),
      ) || [];

      queryClient.setQueryData(
        socialKeys.comments(classId, postId),
        previousComments.filter((c) => c.id !== commentId),
      );
      return { previousComments, postId };
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: socialKeys.posts(classId) });
      toast.success('Comentário removido.');
    },
    onError: (err, variables, context) => {
      toast.error('Falha ao remover comentário.');
      if (context?.previousComments) {
        queryClient.setQueryData(
          socialKeys.comments(classId, context.postId),
          context.previousComments,
        );
      }
    },
  });

  const handleOpenComments = useCallback((post: EnrichedSocialPost) => {
    setViewingCommentsForPostId(post.id);
  }, []);

  const handleCloseComments = useCallback(() => {
    setViewingCommentsForPostId(null);
  }, []);

  return {
    posts: postsData ?? [],
    isLoading,
    isPostsError,
    createPost: createPostMutation.mutateAsync,
    isCreatingPost: createPostMutation.isPending,
    toggleLike: toggleLikeMutation.mutateAsync,
    deletePost: deletePostMutation.mutateAsync,
    refetch: () => queryClient.invalidateQueries({ queryKey: socialKeys.posts(classId) }),

    comments: commentsData ?? [],
    isCommentsLoading,
    viewingCommentsForPostId,
    fetchComments: handleOpenComments,
    closeComments: handleCloseComments,
    addComment: addCommentMutation.mutateAsync,
    isAddingComment: addCommentMutation.isPending,
    deleteComment: deleteCommentMutation.mutateAsync,
  };
}

