import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken } from '@/lib/core/utils/jwt';
import { quizzesService } from '@/lib/core/services/class/quizzes.service';
import { usersService } from '@/lib/core/services/class/users.service';
import type { Quiz } from '@/lib/core/types/quiz.type';
import type { ClassUser } from '@/lib/core/types/user.type';
import { COOKIE_NAMES, getCookie } from '@/lib/core/utils/cookie';

export type EnrichedQuiz = Quiz & {
  isCompleted: boolean;
  bestScore?: number;
  scoreData?: ClassUser['completedQuizzes'][string];
};

export async function GET(request: NextRequest) {
  try {
    const token = await getCookie(COOKIE_NAMES.access);
    if (!token) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    const decodedPayload = await verifyAccessToken(token);
    if (!decodedPayload) return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
    const userId = decodedPayload.subjectId;

    const { searchParams } = new URL(request.url);
    const classId = searchParams.get('classId');
    if (!classId) return NextResponse.json({ error: 'classId é obrigatório' }, { status: 400 });

    const [allQuizzes, userProgress] = await Promise.all([
      quizzesService.getAll(classId),
      usersService.getOne(classId, userId)
    ]);

    const enrichedQuizzes: EnrichedQuiz[] = allQuizzes.map(quiz => {
      const userQuizData = userProgress?.completedQuizzes?.[quiz.id];
      const isCompleted = !!userQuizData;
      const bestScore = userQuizData?.bestScore ?? 0;

      return {
        ...quiz,
        isCompleted,
        bestScore,
        scoreData: userQuizData
      };
    });

    return NextResponse.json(enrichedQuizzes);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
    console.error("API Error GET /api/quizzes:", error);
    return NextResponse.json({ error: `Erro ao buscar quizzes: ${errorMessage}` }, { status: 500 });
  }
}

