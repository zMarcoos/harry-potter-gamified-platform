import { NextRequest, NextResponse } from 'next/server';
import { globalRepositories } from '@/lib/core/repositories';
import { verifyAccessToken } from '@/lib/core/utils/jwt';
import { COOKIE_NAMES, getCookieByRequest } from '@/lib/core/utils/cookie';

export async function GET(request: NextRequest) {
  try {
    const token = getCookieByRequest(request, COOKIE_NAMES.access);
    if (!token) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });

    const decodedPayload = await verifyAccessToken(token);
    if (!decodedPayload) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const classId = searchParams.get('id');
    if (!classId) {
      return NextResponse.json({ error: 'O ID da turma é obrigatório' }, { status: 400 });
    }

    const userId = decodedPayload.subjectId;
    const userProfile = await globalRepositories.users.findById(userId);
    if (!userProfile) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    if (!userProfile.enrollments.includes(classId)) {
      return NextResponse.json({ error: 'Você não está matriculado nesta turma.' }, { status: 403 });
    }

    const classInfo = await globalRepositories.classes.findById(classId);
    if (!classInfo) {
      return NextResponse.json({ error: 'Turma não encontrada' }, { status: 404 });
    }

    const professorProfile = await globalRepositories.users.findById(classInfo.professorId);

    const enrichedClassData = {
      ...classInfo,
      professor: {
        name: professorProfile?.profile.name || 'Desconhecido',
        avatar: professorProfile?.profile.avatar || '',
      }
    };

    return NextResponse.json(enrichedClassData);
  } catch (error) {
    console.error("Erro na validação da turma:", error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
