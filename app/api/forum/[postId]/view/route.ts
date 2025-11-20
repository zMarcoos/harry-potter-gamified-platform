import { NextRequest, NextResponse } from 'next/server';
import { forumService } from '@/lib/core/services/class/forum.service';

export async function POST(request: NextRequest, props: { params: Promise<{ postId: string }> }) {
  const params = await props.params;
  try {
    const { postId } = params;

    const { classId } = await request.json();
    if (!classId) return NextResponse.json({ error: "classId é obrigatório" }, { status: 400 });

    await forumService.incrementViews(classId, postId);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao incrementar visualização.' }, { status: 500 });
  }
}
