import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken } from '@/lib/core/utils/jwt';
import { quizSubmissionService } from '@/lib/core/services/class/quiz-submission.service';
import { z } from 'zod/v4';
import { COOKIE_NAMES, getCookie } from '@/lib/core/utils/cookie';

const submitQuizPayloadSchema = z.object({
  classId: z.string().min(1),
  quizId: z.string().min(1),
  answers: z.array(z.number().int().nonnegative().nullable()),
});

export async function POST(request: NextRequest) {
  try {
    const token = await getCookie(COOKIE_NAMES.access);
    if (!token) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    const decodedPayload = await verifyAccessToken(token);
    if (!decodedPayload) return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
    const userId = decodedPayload.subjectId;

    const body = await request.json();
    const validation = submitQuizPayloadSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: "Dados inválidos", details: validation.error.format() }, { status: 400 });
    }

    const { classId, quizId, answers } = validation.data;

    const results = await quizSubmissionService.submitAttempt(
      classId,
      userId,
      quizId,
      answers
    );

    return NextResponse.json(results);

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
    console.error("API Error POST /api/quizzes/submit:", error);
    return NextResponse.json({ error: `Erro ao submeter quiz: ${errorMessage}` }, { status: 500 });
  }
}
