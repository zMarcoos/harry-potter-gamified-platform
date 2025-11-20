import { NextRequest, NextResponse } from 'next/server';
import { socialService } from '@/lib/core/services/class/social.service';

export async function DELETE(
  request: NextRequest,
  props: { params: Promise<{ postId: string, id: string }> }
) {
  const params = await props.params;
  try {
    const { postId, id } = params;
    const { searchParams } = new URL(request.url);

    const classId = searchParams.get('classId');
    if (!classId) {
      return NextResponse.json({ error: "O 'classId' é obrigatório." }, { status: 400 });
    }

    await socialService.removeComment(classId, postId, id);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erro ao deletar comentário.';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
