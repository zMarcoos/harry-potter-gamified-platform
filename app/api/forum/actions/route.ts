import { NextResponse, type NextRequest } from 'next/server';
import { globalRepositories } from '@/lib/core/repositories';
import type { ForumPost } from '@/lib/core/types/forum.type';

type ActionBody =
  | { action: 'toggle_like'; postId: string; classId: string; userId: string }
  | { action: 'delete'; postId: string; classId: string; userId: string };

export async function POST(request: NextRequest) {
  try {
    const { action, postId, classId, userId } = (await request.json()) as ActionBody;

    if (!action || !postId || !classId || !userId) {
      return NextResponse.json(
        { error: 'Ação, postId, classId e userId são obrigatórios.' },
        { status: 400 }
      );
    }

    const cls = await globalRepositories.classes.findById(classId);
    if (!cls) return NextResponse.json({ error: 'Turma não encontrada.' }, { status: 404 });

    const posts: ForumPost[] = Array.isArray(cls.forumPosts) ? [...cls.forumPosts] : [];
    const idx = posts.findIndex((p) => p.id === postId);
    if (idx === -1) return NextResponse.json({ error: 'Post não encontrado.' }, { status: 404 });

    const post = posts[idx];

    if (action === 'toggle_like') {
      const uid = String(userId);
      const likes = Array.isArray(post.likes) ? post.likes : [];
      post.likes = likes.includes(uid) ? likes.filter((x) => x !== uid) : [...likes, uid];
      posts[idx] = post;

      await globalRepositories.classes.update(classId, { forumPosts: posts });
      return NextResponse.json({ success: true });
    }

    if (action === 'delete') {
      if (String(post.authorId) !== String(userId)) {
        return NextResponse.json({ error: 'Sem permissão para deletar este post.' }, { status: 403 });
      }

      posts.splice(idx, 1);
      await globalRepositories.classes.update(classId, { forumPosts: posts });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: `Ação '${action}' desconhecida.` }, { status: 400 });
  } catch (err) {
    console.error('[API ERRO /api/forum/actions]', err);
    return NextResponse.json({ error: 'Erro ao processar a ação.' }, { status: 500 });
  }
}
