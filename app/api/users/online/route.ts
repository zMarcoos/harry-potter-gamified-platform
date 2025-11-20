import { NextRequest, NextResponse } from 'next/server';
import { globalRepositories } from '@/lib/core/repositories';
import type { ClientUser } from '@/lib/core/types/user.type';

const ONLINE_THRESHOLD_MINUTES = 5;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const classId = searchParams.get('classId');

    if (!classId) {
      return NextResponse.json(
        { error: "O parâmetro 'classId' é obrigatório." },
        { status: 400 }
      );
    }

    const allUsers: ClientUser[] = await globalRepositories.users.all();

    const now = new Date();
    const onlineThreshold = new Date(
      now.getTime() - ONLINE_THRESHOLD_MINUTES * 60 * 1000
    );

    const onlineUsersInClass = allUsers
      .filter((user) => {
        const isEnrolled = user.enrollments.includes(classId);
        const isActive = user.activity.isActive;
        return isEnrolled && isActive;
      })
      .map((user) => ({
        id: user.id,
        name: user.profile.name,
        house: user.house,
        avatar: user.profile.avatar,
        status: 'Online',
      }));

    return NextResponse.json(onlineUsersInClass);
  } catch (error) {
    console.error('Falha ao buscar usuários online:', error);
    return NextResponse.json(
      {
        error: 'Não foi possível buscar os usuários online.',
      },
      { status: 500 }
    );
  }
}
