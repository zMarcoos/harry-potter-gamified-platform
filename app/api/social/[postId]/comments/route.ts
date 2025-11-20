import { NextRequest, NextResponse } from 'next/server';
import { socialService } from '@/lib/core/services/class/social.service';
import { z } from 'zod/v4';

const createCommentSchema = z.object({
  classId: z.string().min(1),
  authorId: z.string().min(1),
  content: z.string().min(1, "O comentário não pode estar vazio.").max(1000),
});

export async function GET(req: NextRequest, props: { params: Promise<{ postId: string }> }) {
  const params = await props.params;
  try {
    const { postId } = params;
    const { searchParams } = new URL(req.url);

    const classId = searchParams.get('classId');
    if (!classId) {
      return NextResponse.json({ error: "O parâmetro 'classId' é obrigatório." }, { status: 400 });
    }

    const post = await socialService.getById(classId, postId);
    const comments = post?.comments ?? [];

    return NextResponse.json(comments);
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao buscar comentários.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest, props: { params: Promise<{ postId: string }> }) {
  const params = await props.params;
  try {
    const { postId } = params;
    const body = await req.json();
    const validation = createCommentSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: validation.error.format() }, { status: 400 });
    }

    const { classId, authorId, content } = validation.data;
    const newComment = await socialService.addComment(classId, postId, authorId, content);

    return NextResponse.json(newComment, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao adicionar comentário.' }, { status: 500 });
  }
}
