import { globalRepositories } from '@/lib/core/repositories';
import type { ForumPost, ForumPostReply } from '@/lib/core/types/forum.type';
import { NextRequest, NextResponse } from 'next/server';

type Body = {
  classId: string;
  postId: string;
  replyId: string;
  userId: string;
};

export async function POST(request: NextRequest) {
  try {
    const { classId, postId, replyId, userId }: Body = await request.json();

    if (!classId || !postId || !replyId || !userId) {
      return NextResponse.json(
        { error: 'classId, postId, replyId e userId são obrigatórios.' },
        { status: 400 }
      );
    }

    const cls = await globalRepositories.classes.findById(classId);
    if (!cls) return NextResponse.json({ error: 'Turma não encontrada.' }, { status: 404 });

    const posts: ForumPost[] = Array.isArray(cls.forumPosts) ? [...cls.forumPosts] : [];
    const postIndex = posts.findIndex((p) => p.id === postId);
    if (postIndex === -1) return NextResponse.json({ error: 'Post não encontrado.' }, { status: 404 });

    const post = posts[postIndex];

    if (String(post.authorId) !== String(userId)) {
      return NextResponse.json({ error: 'Sem permissão para marcar melhor resposta.' }, { status: 403 });
    }

    const replies: ForumPostReply[] = Array.isArray(post.replies) ? [...post.replies] : [];
    const rIdx = replies.findIndex((r) => r.id === replyId);
    if (rIdx === -1) return NextResponse.json({ error: 'Resposta não encontrada.' }, { status: 404 });

    const nextReplies: ForumPostReply[] = replies.map((r) =>
      r.id === replyId ? { ...r, isAccepted: true } : { ...r, isAccepted: false }
    );

    const nextPost: ForumPost = {
      ...post,
      replies: nextReplies,
      isAnswered: true,
    };

    posts[postIndex] = nextPost;
    await globalRepositories.classes.update(classId, { forumPosts: posts });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[API ERRO POST /api/forum/replies/best]', err);
    return NextResponse.json({ error: 'Erro ao marcar melhor resposta.' }, { status: 500 });
  }
}
