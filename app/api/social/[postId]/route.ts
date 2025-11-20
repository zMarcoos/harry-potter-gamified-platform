import { NextRequest, NextResponse } from 'next/server';
import { socialService } from '@/lib/core/services/class/social.service';

export async function DELETE(req: NextRequest, props: { params: Promise<{ postId: string }> }) {
  const params = await props.params;
  try {
    const { postId } = params;
    const { searchParams } = new URL(req.url);
    const classId = searchParams.get('classId');

    if (!classId) {
      return NextResponse.json({ error: "O parâmetro 'classId' é obrigatório." }, { status: 400 });
    }

    if (!postId) {
      return NextResponse.json({ error: "O 'postId' é obrigatório na URL." }, { status: 400 });
    }

    await socialService.removePost(classId, postId);

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido.';
    console.error(`API Error DELETE /api/social/${params.postId}:`, error);
    return NextResponse.json({ error: `Erro ao deletar post: ${errorMessage}` }, { status: 500 });
  }
}
