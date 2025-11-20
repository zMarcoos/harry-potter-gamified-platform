import { NextRequest, NextResponse } from 'next/server';
import { forumService } from '@/lib/core/services/class/forum.service';

export async function DELETE(requesst: NextRequest, props: { params: Promise<{ postId: string }> }) {
  const params = await props.params;
  try {
    const { postId } = params;
    const { searchParams } = new URL(requesst.url);
    const classId = searchParams.get('classId');

    if (!classId) {
      return NextResponse.json({ error: "O parâmetro 'classId' é obrigatório." }, { status: 400 });
    }

    if (!postId) {
      return NextResponse.json({ error: "O 'postId' é obrigatório na URL." }, { status: 400 });
    }

    await forumService.removePost(classId, postId);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido.';
    console.error(`API Error DELETE /api/forum/${params.postId}:`, error);
    return NextResponse.json({ error: `Erro ao deletar post: ${errorMessage}` }, { status: 500 });
  }
}
