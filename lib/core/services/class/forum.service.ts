import { globalRepositories } from '@/lib/core/repositories';
import {
  ForumPostSchema,
  ForumPostReplySchema,
  ForumPost,
  ForumPostReply,
} from '@/lib/core/types/forum.type';
import { randomUUID } from 'node:crypto';
import { getClassOrThrow } from '../../utils/class';

function findPostIndex(items: ForumPost[], postId: string): number {
  return items.findIndex((p) => p.id === postId);
}

function findReplyIndex(post: ForumPost, replyId: string): number {
  return post.replies.findIndex((r) => r.id === replyId);
}

export const forumService = {
  async list(classId: string): Promise<ForumPost[]> {
    const clazz = await getClassOrThrow(classId);
    const items = clazz.forumPosts ?? [];
    return [...items].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  },

  async getById(classId: string, postId: string): Promise<ForumPost | null> {
    const clazz = await getClassOrThrow(classId);
    return (clazz.forumPosts ?? []).find((p) => p.id === postId) ?? null;
  },

  async createPost(
    classId: string,
    input: Omit<
      ForumPost,
      'id' | 'createdAt' | 'updatedAt' | 'views' | 'likes' | 'replies'
    >,
  ): Promise<ForumPost> {
    const candidate: ForumPost = {
      id: randomUUID(),
      ...input,
      createdAt: new Date(),
      updatedAt: new Date(),
      views: 0,
      likes: [],
      replies: [],
    };

    const post = ForumPostSchema.parse(candidate);

    await globalRepositories.classes.update(classId, (clazz) => {
      if (!clazz) throw new Error(`Turma '${classId}' não encontrada.`);
      const next = [post, ...(clazz.forumPosts ?? [])];
      return { forumPosts: next };
    });

    return post;
  },

  async updatePost(
    classId: string,
    postId: string,
    updates: Partial<
      Pick<
        ForumPost,
        | 'title'
        | 'content'
        | 'category'
        | 'difficulty'
        | 'tags'
        | 'isPinned'
        | 'isAnswered'
      >
    >,
  ): Promise<ForumPost> {
    let updatedPost: ForumPost | null = null;

    const updatedClass = await globalRepositories.classes.update(
      classId,
      (clazz) => {
        if (!clazz) throw new Error(`Turma '${classId}' não encontrada.`);
        const items = clazz.forumPosts ?? [];
        const index = findPostIndex(items, postId);
        if (index === -1) throw new Error(`Post '${postId}' não encontrado.`);

        const current = items[index];
        const candidate: ForumPost = ForumPostSchema.parse({
          ...current,
          ...updates,
          updatedAt: new Date(),
        });
        updatedPost = candidate;

        const next = [...items];
        next[index] = candidate;
        return { forumPosts: next };
      },
    );

    if (!updatedClass)
      throw new Error(`Turma '${classId}' não encontrada para atualização.`);
    if (!updatedPost) throw new Error('Falha ao atualizar post.');

    return updatedPost;
  },

  async removePost(classId: string, postId: string): Promise<void> {
    await globalRepositories.classes.update(classId, (clazz) => {
      if (!clazz) throw new Error(`Turma '${classId}' não encontrada.`);
      const items = clazz.forumPosts ?? [];
      const exists = items.some((p) => p.id === postId);
      if (!exists) throw new Error(`Post '${postId}' não encontrado.`);

      const next = items.filter((p) => p.id !== postId);
      return { forumPosts: next };
    });
  },

  async addReply(
    classId: string,
    postId: string,
    input: Omit<ForumPostReply, 'id' | 'createdAt' | 'likes'>,
  ): Promise<ForumPostReply> {
    const replyCandidate: ForumPostReply = ForumPostReplySchema.parse({
      id: randomUUID(),
      ...input,
      createdAt: new Date(),
      likes: [],
    });

    await globalRepositories.classes.update(classId, (clazz) => {
      if (!clazz) throw new Error(`Turma '${classId}' não encontrada.`);
      const items = clazz.forumPosts ?? [];
      const pIdx = findPostIndex(items, postId);
      if (pIdx === -1) throw new Error(`Post '${postId}' não encontrado.`);

      const updatedPost = ForumPostSchema.parse({
        ...items[pIdx],
        replies: [...items[pIdx].replies, replyCandidate],
        updatedAt: new Date(),
      });

      const next = [...items];
      next[pIdx] = updatedPost;
      return { forumPosts: next };
    });

    return replyCandidate;
  },

  async updateReply(
    classId: string,
    postId: string,
    replyId: string,
    updates: Partial<Pick<ForumPostReply, 'content'>>,
  ): Promise<ForumPostReply> {
    let updatedReply: ForumPostReply | null = null;

    const updatedClass = await globalRepositories.classes.update(
      classId,
      (clazz) => {
        if (!clazz) throw new Error(`Turma '${classId}' não encontrada.`);
        const items = clazz.forumPosts ?? [];
        const pIdx = findPostIndex(items, postId);
        if (pIdx === -1) throw new Error(`Post '${postId}' não encontrado.`);

        const post = items[pIdx];
        const rIdx = findReplyIndex(post, replyId);
        if (rIdx === -1) throw new Error(`Reply '${replyId}' não encontrada.`);

        const candidate = ForumPostReplySchema.parse({
          ...post.replies[rIdx],
          ...updates,
        });
        updatedReply = candidate;

        const updatedPost = ForumPostSchema.parse({
          ...post,
          replies: [
            ...post.replies.slice(0, rIdx),
            candidate,
            ...post.replies.slice(rIdx + 1),
          ],
          updatedAt: new Date(),
        });

        const next = [...items];
        next[pIdx] = updatedPost;
        return { forumPosts: next };
      },
    );

    if (!updatedClass)
      throw new Error(`Turma '${classId}' não encontrada para atualização.`);
    if (!updatedReply) throw new Error('Falha ao atualizar reply.');

    return updatedReply;
  },

  async removeReply(
    classId: string,
    postId: string,
    replyId: string,
  ): Promise<void> {
    await globalRepositories.classes.update(classId, (clazz) => {
      if (!clazz) throw new Error(`Turma '${classId}' não encontrada.`);
      const items = clazz.forumPosts ?? [];
      const pIdx = findPostIndex(items, postId);
      if (pIdx === -1) throw new Error(`Post '${postId}' não encontrado.`);

      const post = items[pIdx];
      const exists = post.replies.some((r) => r.id === replyId);
      if (!exists) throw new Error(`Reply '${replyId}' não encontrada.`);

      const updatedPost = ForumPostSchema.parse({
        ...post,
        replies: post.replies.filter((r) => r.id !== replyId),
        updatedAt: new Date(),
      });

      const next = [...items];
      next[pIdx] = updatedPost;
      return { forumPosts: next };
    });
  },

  async toggleLikePost(
    classId: string,
    postId: string,
    userId: string,
  ): Promise<{ liked: boolean; likesCount: number }> {
    let result: { liked: boolean; likesCount: number } | null = null;

    const updatedClass = await globalRepositories.classes.update(
      classId,
      (clazz) => {
        if (!clazz) throw new Error(`Turma '${classId}' não encontrada.`);
        const items = clazz.forumPosts ?? [];
        const index = findPostIndex(items, postId);
        if (index === -1) throw new Error(`Post '${postId}' não encontrado.`);

        const post = items[index];
        const already = post.likes.includes(userId);
        const nextLikes = already
          ? post.likes.filter((id) => id !== userId)
          : [...post.likes, userId];

        const updatedPost = ForumPostSchema.parse({
          ...post,
          likes: nextLikes,
          updatedAt: new Date(),
        });

        const next = [...items];
        next[index] = updatedPost;
        result = { liked: !already, likesCount: nextLikes.length };
        return { forumPosts: next };
      },
    );

    if (!updatedClass)
      throw new Error(`Turma '${classId}' não encontrada para atualização.`);
    if (!result) throw new Error('Falha ao processar like.');

    return result;
  },

  async toggleLikeReply(
    classId: string,
    postId: string,
    replyId: string,
    userId: string,
  ): Promise<{ liked: boolean; likesCount: number }> {
    let result: { liked: boolean; likesCount: number } | null = null;

    const updatedClass = await globalRepositories.classes.update(
      classId,
      (clazz) => {
        if (!clazz) throw new Error(`Turma '${classId}' não encontrada.`);
        const items = clazz.forumPosts ?? [];
        const pIdx = findPostIndex(items, postId);
        if (pIdx === -1) throw new Error(`Post '${postId}' não encontrado.`);

        const post = items[pIdx];
        const rIdx = findReplyIndex(post, replyId);
        if (rIdx === -1) throw new Error(`Reply '${replyId}' não encontrada.`);

        const reply = post.replies[rIdx];
        const already = reply.likes.includes(userId);
        const nextReplyLikes = already
          ? reply.likes.filter((id) => id !== userId)
          : [...reply.likes, userId];

        const updatedReply = ForumPostReplySchema.parse({
          ...reply,
          likes: nextReplyLikes,
        });

        const updatedPost = ForumPostSchema.parse({
          ...post,
          replies: [
            ...post.replies.slice(0, rIdx),
            updatedReply,
            ...post.replies.slice(rIdx + 1),
          ],
          updatedAt: new Date(),
        });

        const next = [...items];
        next[pIdx] = updatedPost;
        result = { liked: !already, likesCount: nextReplyLikes.length };
        return { forumPosts: next };
      },
    );

    if (!updatedClass)
      throw new Error(`Turma '${classId}' não encontrada para atualização.`);
    if (!result) throw new Error('Falha ao processar like.');

    return result;
  },

  async incrementViews(classId: string, postId: string): Promise<void> {
    await globalRepositories.classes.update(classId, (clazz) => {
      if (!clazz) throw new Error(`Turma '${classId}' não encontrada.`);
      const items = clazz.forumPosts ?? [];
      const index = findPostIndex(items, postId);
      if (index === -1) throw new Error(`Post '${postId}' não encontrado.`);

      const post = items[index];
      const updatedPost = ForumPostSchema.parse({
        ...post,
        views: (post.views ?? 0) + 1,
      });

      const next = [...items];
      next[index] = updatedPost;
      return { forumPosts: next };
    });
  },
};
