import { NextRequest, NextResponse } from 'next/server';
import { globalRepositories } from '@/lib/core/repositories';
import { forumService } from '@/lib/core/services/class/forum.service';
import { CreateReplySchema } from '@/lib/core/types/forum.type';

export async function GET(request: NextRequest, props: { params: Promise<{ postId: string }> }) {
  const params = await props.params;

  try {
    const { postId } = params;
    const { searchParams } = new URL(request.url);

    const classId = searchParams.get('classId');
    if (!classId) return NextResponse.json({ error: "classId é obrigatório" }, { status: 400 });

    const post = await forumService.getById(classId, postId);
    if (!post) return NextResponse.json({ error: "Post não encontrado" }, { status: 404 });

    const enrichedRepliesPromises = post.replies.map(async (reply) => {
      const authorProfile = await globalRepositories.users.findById(reply.authorId);
      return {
        ...reply,
        author: {
          name: authorProfile?.profile.name || 'Desconhecido',
          avatar: authorProfile?.profile.avatar || '',
        }
      };
    });

    const enrichedReplies = await Promise.all(enrichedRepliesPromises);
    return NextResponse.json(enrichedReplies);
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao buscar respostas.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest, props: { params: Promise<{ postId: string }> }) {
  const params = await props.params;
  try {
    const { postId } = params;
    const body = await request.json();

    const validation = CreateReplySchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: "Dados inválidos", details: validation.error.issues }, { status: 400 });
    }

    const { classId, authorId, ...data } = validation.data;
    const newReply = await forumService.addReply(classId, postId, {
      authorId,
      ...data
    });

    const authorProfile = await globalRepositories.users.findById(authorId);
    const enrichedReply = {
      ...newReply,
      author: {
        id: authorId,
        name: authorProfile?.profile.name || authorId,
        avatar: authorProfile?.profile.avatar || ''
      }
    };

    return NextResponse.json(enrichedReply, { status: 201 });
  } catch (err) {
    console.error('[API ERRO POST /api/forum/replies]', err);
    return NextResponse.json({ error: 'Erro ao criar resposta.' }, { status: 500 });
  }
}
