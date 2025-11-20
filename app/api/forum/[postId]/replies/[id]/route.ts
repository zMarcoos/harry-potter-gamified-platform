import { NextResponse, type NextRequest } from 'next/server';
import { forumService } from '@/lib/core/services/class/forum.service';
import { z } from 'zod/v4';

const deleteReplyPayloadSchema = z.object({
  classId: z.string().min(1),
  userId: z.string().min(1).optional(),
});

export async function DELETE(request: NextRequest, { params }: { params: { postId: string, id: string } }) {
  try {
    const { postId, id: replyId } = params;

    const body = await request.json();
    const validation = deleteReplyPayloadSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: "Dados inválidos", details: validation.error.format() }, { status: 400 });
    }
    const { classId } = validation.data;

    await forumService.removeReply(classId, postId, replyId);

    return new NextResponse(null, { status: 204 });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Erro desconhecido";
    console.error(`[API ERRO DELETE /api/forum/.../replies/${params.id}]`, err);

    if (errorMessage.includes('não encontrada')) {
      return NextResponse.json({ error: errorMessage }, { status: 404 });
    }
    
    if (errorMessage.includes('Sem permissão')) {
      return NextResponse.json({ error: errorMessage }, { status: 403 });
    }

    return NextResponse.json({ error: `Erro ao deletar resposta: ${errorMessage}` }, { status: 500 });
  }
}
