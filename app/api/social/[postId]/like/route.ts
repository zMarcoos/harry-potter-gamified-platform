import { NextRequest, NextResponse } from 'next/server';
import { socialService } from '@/lib/core/services/class/social.service';
import { z } from 'zod/v4';

const toggleLikePayloadSchema = z.object({
  classId: z.string().min(1),
  userId: z.string().min(1),
});

export async function POST(request: NextRequest, props: { params: Promise<{ postId: string }> }) {
  const params = await props.params;

  try {
    const { postId } = params;
    const body = await request.json();
    const validation = toggleLikePayloadSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: "Dados inválidos", details: validation.error.format() }, { status: 400 });
    }

    const { classId, userId } = validation.data;
    const result = await socialService.toggleLike(classId, postId, userId);

    return NextResponse.json(result);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido.';
    console.error(`API Error POST /api/social/${params.postId}/like:`, error);
    return NextResponse.json({ error: `Erro ao processar curtida: ${errorMessage}` }, { status: 500 });
  }
}
