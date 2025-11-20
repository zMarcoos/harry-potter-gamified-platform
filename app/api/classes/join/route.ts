import { globalRepositories } from '@/lib/core/repositories';
import { NextRequest, NextResponse } from 'next/server';
import { verifyPassword } from '@/lib/core/utils/bcrypt';
import { ClassUserSchema, type ClassUser } from '@/lib/core/types/user.type';

const defaultClassUserData: ClassUser = {
  progress: {
    xp: 0,
    level: 1,
    streak: 0,
    currencies: {
      galleons: 0,
      gems: 0
    }
  },
  completedQuizzes: {},
  missionProgress: {},
  unlockedAchievements: [],
  inventory: []
};

const validatedDefaultData = ClassUserSchema.parse(defaultClassUserData);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { classId, userId, password } = body;

    if (!classId || !userId) {
      return NextResponse.json({ error: 'ID da turma e do usuário são obrigatórios.' }, { status: 400 });
    }

    const classData = await globalRepositories.classes.findById(classId);
    const user = await globalRepositories.users.findById(userId);

    if (!classData) return NextResponse.json({ error: 'Turma não encontrada.' }, { status: 404 });
    if (!user) return NextResponse.json({ error: 'Usuário não encontrado.' }, { status: 404 });

    const isAlreadyEnrolled = user.enrollments?.includes(classId);
    const isAlreadyInClassUsers = !!classData.users?.[userId];
    if (isAlreadyEnrolled && isAlreadyInClassUsers) {
      return NextResponse.json({ success: true, message: 'Já matriculado nesta turma.' });
    }

    if (classData.isPrivate) {
      if (!password) {
        return NextResponse.json({ error: 'Senha é obrigatória para turmas privadas.' }, { status: 401 });
      }

      const isPasswordCorrect = classData.password ? await verifyPassword(classData.password, password) : false;
      if (!isPasswordCorrect) {
        return NextResponse.json({ error: 'Senha incorreta.' }, { status: 403 });
      }
    }

    if (!isAlreadyEnrolled) {
      const updatedEnrollments = [...(user.enrollments || []), classId];
      await globalRepositories.users.update(userId, { enrollments: updatedEnrollments });
    }

    if (!isAlreadyInClassUsers) {
      await globalRepositories.classes.update(classId, (currentClass) => {
        const currentUsers = currentClass.users || {};

        const updatedUsers = {
          ...currentUsers,
          [userId]: validatedDefaultData
        };

        return { users: updatedUsers };
      });
    }

    return NextResponse.json({ success: true, message: 'Matrícula realizada com sucesso!' });
  } catch (error: any) {
    console.error('[API ERRO /api/classes/join]:', error);
    return NextResponse.json({ error: 'Erro interno do servidor ao processar a matrícula.' }, { status: 500 });
  }
}
