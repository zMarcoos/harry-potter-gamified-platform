import { globalRepositories } from '@/lib/core/repositories';
import {
  SocialPostSchema,
  SocialCommentSchema,
  SocialPost,
  SocialComment,
} from '@/lib/core/types/social.type';
import { randomUUID } from 'node:crypto';
import { getClassOrThrow } from '../../utils/class';

function findPostIndex(feed: SocialPost[], postId: string): number {
  return feed.findIndex((post) => post.id === postId);
}

export const socialService = {
  async list(classId: string): Promise<SocialPost[]> {
    const clazz = await getClassOrThrow(classId);
    const feed = clazz.socialFeed ?? [];
    return [...feed].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );
  },

  async getById(classId: string, postId: string): Promise<SocialPost | null> {
    const clazz = await getClassOrThrow(classId);
    return (clazz.socialFeed ?? []).find((post) => post.id === postId) ?? null;
  },

  async createPost(
    classId: string,
    authorId: string,
    content: string,
  ): Promise<SocialPost> {
    if (!content?.trim()) throw new Error('Conteúdo obrigatório.');

    const candidate: SocialPost = {
      id: randomUUID(),
      authorId,
      content: content.trim(),
      timestamp: new Date(),
      likes: [],
      comments: [],
    };

    const post = SocialPostSchema.parse(candidate);

    await globalRepositories.classes.update(classId, (clazz) => {
      if (!clazz) throw new Error(`Turma '${classId}' não encontrada.`);
      const nextFeed = [post, ...(clazz.socialFeed ?? [])];
      return { socialFeed: nextFeed };
    });

    return post;
  },

  async updatePost(
    classId: string,
    postId: string,
    updates: { content?: string },
  ): Promise<SocialPost> {
    let parsedPost: SocialPost | null = null;

    const updatedClass = await globalRepositories.classes.update(
      classId,
      (clazz) => {
        if (!clazz) throw new Error(`Turma '${classId}' não encontrada.`);
        const feed = clazz.socialFeed ?? [];
        const index = findPostIndex(feed, postId);
        if (index === -1) throw new Error(`Post '${postId}' não encontrado.`);

        const current = feed[index];
        const candidate: SocialPost = {
          ...current,
          ...(typeof updates.content === 'string'
            ? { content: updates.content.trim() }
            : {}),
        };

        const parsed = SocialPostSchema.parse(candidate);
        parsedPost = parsed;

        const nextFeed = [...feed];
        nextFeed[index] = parsed;
        return { socialFeed: nextFeed };
      },
    );

    if (!updatedClass)
      throw new Error(`Turma '${classId}' não encontrada para atualização.`);
    if (!parsedPost) throw new Error('Falha ao atualizar post.');

    return parsedPost;
  },

  async removePost(classId: string, postId: string): Promise<void> {
    await globalRepositories.classes.update(classId, (clazz) => {
      if (!clazz) throw new Error(`Turma '${classId}' não encontrada.`);
      const feed = clazz.socialFeed ?? [];
      const index = findPostIndex(feed, postId);
      if (index === -1) throw new Error(`Post '${postId}' não encontrado.`);

      const nextFeed = feed.filter((p) => p.id !== postId);
      return { socialFeed: nextFeed };
    });
  },

  async addComment(
    classId: string,
    postId: string,
    authorId: string,
    content: string,
  ): Promise<SocialComment> {
    if (!content?.trim()) throw new Error('Conteúdo obrigatório.');

    const commentCandidate: SocialComment = {
      id: randomUUID(),
      authorId,
      content: content.trim(),
      timestamp: new Date(),
    };
    const newComment = SocialCommentSchema.parse(commentCandidate);

    await globalRepositories.classes.update(classId, (clazz) => {
      if (!clazz) throw new Error(`Turma '${classId}' não encontrada.`);
      const feed = clazz.socialFeed ?? [];
      const index = findPostIndex(feed, postId);
      if (index === -1) throw new Error(`Post '${postId}' não encontrado.`);

      const updatedPost: SocialPost = {
        ...feed[index],
        comments: [...feed[index].comments, newComment],
      };
      const parsedPost = SocialPostSchema.parse(updatedPost);

      const nextFeed = [...feed];
      nextFeed[index] = parsedPost;
      return { socialFeed: nextFeed };
    });

    return newComment;
  },

  async updateComment(
    classId: string,
    postId: string,
    commentId: string,
    content: string,
  ): Promise<SocialComment> {
    if (!content?.trim()) throw new Error('Conteúdo obrigatório.');

    let parsedComment: SocialComment | null = null;

    const updatedClass = await globalRepositories.classes.update(
      classId,
      (clazz) => {
        if (!clazz) throw new Error(`Turma '${classId}' não encontrada.`);
        const feed = clazz.socialFeed ?? [];
        const postIndex = findPostIndex(feed, postId);
        if (postIndex === -1) throw new Error(`Post '${postId}' não encontrado.`);

        const post = feed[postIndex];
        const commentIndex = post.comments.findIndex((c) => c.id === commentId);
        if (commentIndex === -1)
          throw new Error(`Comentário '${commentId}' não encontrado.`);

        const candidate: SocialComment = {
          ...post.comments[commentIndex],
          content: content.trim(),
        };
        const parsed = SocialCommentSchema.parse(candidate);
        parsedComment = parsed;

        const updatedPost: SocialPost = {
          ...post,
          comments: [
            ...post.comments.slice(0, commentIndex),
            parsed,
            ...post.comments.slice(commentIndex + 1),
          ],
        };
        const parsedPost = SocialPostSchema.parse(updatedPost);

        const nextFeed = [...feed];
        nextFeed[postIndex] = parsedPost;
        return { socialFeed: nextFeed };
      },
    );

    if (!updatedClass)
      throw new Error(`Turma '${classId}' não encontrada para atualização.`);
    if (!parsedComment) throw new Error('Falha ao atualizar comentário.');

    return parsedComment;
  },

  async removeComment(
    classId: string,
    postId: string,
    commentId: string,
  ): Promise<void> {
    await globalRepositories.classes.update(classId, (clazz) => {
      if (!clazz) throw new Error(`Turma '${classId}' não encontrada.`);
      const feed = clazz.socialFeed ?? [];
      const pIdx = findPostIndex(feed, postId);
      if (pIdx === -1) throw new Error(`Post '${postId}' não encontrado.`);

      const post = feed[pIdx];
      const exists = post.comments.some((comment) => comment.id === commentId);
      if (!exists)
        throw new Error(`Comentário '${commentId}' não encontrado.`);

      const updatedPost: SocialPost = {
        ...post,
        comments: post.comments.filter((comment) => comment.id !== commentId),
      };
      const parsedPost = SocialPostSchema.parse(updatedPost);

      const nextFeed = [...feed];
      nextFeed[pIdx] = parsedPost;
      return { socialFeed: nextFeed };
    });
  },

  async toggleLike(
    classId: string,
    postId: string,
    userId: string,
  ): Promise<{ liked: boolean; likesCount: number }> {
    let result: { liked: boolean; likesCount: number } | null = null;

    const updatedClass = await globalRepositories.classes.update(
      classId,
      (clazz) => {
        if (!clazz) throw new Error(`Turma '${classId}' não encontrada.`);
        const feed = clazz.socialFeed ?? [];
        const index = findPostIndex(feed, postId);
        if (index === -1) throw new Error(`Post '${postId}' não encontrado.`);

        const post = feed[index];
        const already = post.likes.includes(userId);

        const nextLikes = already
          ? post.likes.filter((id) => id !== userId)
          : [...post.likes, userId];

        const updatedPost = SocialPostSchema.parse({ ...post, likes: nextLikes });

        const nextFeed = [...feed];
        nextFeed[index] = updatedPost;

        result = { liked: !already, likesCount: nextLikes.length };
        return { socialFeed: nextFeed };
      },
    );

    if (!updatedClass)
      throw new Error(`Turma '${classId}' não encontrada para atualização.`);
    if (!result) throw new Error('Falha ao processar like.');

    return result;
  },
};
