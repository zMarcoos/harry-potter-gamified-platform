import { NextRequest, NextResponse } from 'next/server';
import { forumService } from '@/lib/core/services/class/forum.service';
import { z } from 'zod/v4';

const toggleLikeReplyPayloadSchema = z.object({
  classId: z.string().nonempty(),
  userId: z.string().nonempty(),
});

export async function POST(request: NextRequest, { params }: { params: { postId: string, id: string } }) {
  try {
    const { postId, id: replyId } = params;
    const body = await request.json();

    const validation = toggleLikeReplyPayloadSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: "Dados inválidos", details: validation.error.issues }, { status: 400 });
    }

    const { classId, userId } = validation.data;

    const result = await forumService.toggleLikeReply(classId, postId, replyId, userId);

    return NextResponse.json(result);

  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Erro desconhecido";
    console.error(`[API ERRO POST /api/forum/${params.postId}/replies/${params.id}/like]`, err);
    return NextResponse.json({ error: `Erro ao curtir/descurtir resposta: ${errorMessage}` }, { status: 500 });
  }
}
