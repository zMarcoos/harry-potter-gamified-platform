import { NextResponse, type NextRequest } from 'next/server';
import { globalRepositories } from '@/lib/core/repositories';
import type { ForumPost } from '@/lib/core/types/forum.type';

function norm(s: unknown): string {
  return String(s ?? '').toLowerCase();
}

function getWhenMs(p: ForumPost): number {
  const d = p.updatedAt ?? p.createdAt;
  return d ? new Date(d).getTime() : 0;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const classId = searchParams.get('classId') ?? '';
    const qRaw = searchParams.get('q') ?? '';
    const q = norm(qRaw).trim();

    if (!classId || q.length === 0) {
      return NextResponse.json(
        { error: 'Parâmetros "classId" e "q" são obrigatórios.' },
        { status: 400 }
      );
    }

    const classData = await globalRepositories.classes.findById(classId);
    if (!classData) {
      return NextResponse.json({ error: 'Turma não encontrada.' }, { status: 404 });
    }

    const posts: ForumPost[] = Array.isArray(classData.forumPosts)
      ? classData.forumPosts
      : [];

    if (posts.length === 0) {
      return NextResponse.json<ForumPost[]>([]);
    }

    const authorIds = Array.from(
      new Set(posts.map((p) => String(p.authorId)).filter(Boolean))
    );

    const usersArray = await Promise.all(
      authorIds.map(async (id) => {
        const u = await globalRepositories.users.findById(id);
        return u ? ([id, u] as const) : null;
      })
    );

    const usersById = new Map<string, UserInternalEntity>();
    for (const pair of usersArray) {
      if (pair) usersById.set(pair[0], pair[1]);
    }

    const matches = (p: ForumPost): boolean => {
      const title = norm(p.title);
      const content = norm(p.content);
      const authorId = norm(p.authorId);
      const tags = Array.isArray(p.tags) ? p.tags.map(norm) : [];

      const authorName =
        usersById.get(p.authorId)?.profile?.name
          ? norm(usersById.get(p.authorId)!.profile!.name)
          : '';

      return (
        title.includes(q) ||
        content.includes(q) ||
        authorId.includes(q) ||
        (authorName.length > 0 && authorName.includes(q)) ||
        tags.some((t) => t.includes(q))
      );
    };

    const filtered = posts.filter(matches);

    const results = filtered.sort((a, b) => {
      const pinA = a.isPinned ? 1 : 0;
      const pinB = b.isPinned ? 1 : 0;
      if (pinA !== pinB) return pinB - pinA;
      return getWhenMs(b) - getWhenMs(a);
    });

    return NextResponse.json<ForumPost[]>(results);
  } catch (err) {
    console.error('[API ERRO /api/forum/search]', err);
    return NextResponse.json({ error: 'Erro ao buscar posts.' }, { status: 500 });
  }
}
