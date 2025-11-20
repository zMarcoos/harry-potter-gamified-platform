import { NextRequest, NextResponse } from 'next/server';
import { globalRepositories } from '@/lib/core/repositories';
import type { HouseId, HouseStats } from '@/lib/core/types/house.type';
import type { ServerUser } from '@/lib/core/types/user.type';
import type { Class } from '@/lib/core/types/class.type';

function calculateStrictRanking(classData: Class, globalUsers: ServerUser[]): HouseStats[] {
  const idToHouseMap = new Map<string, HouseId>();
  globalUsers.forEach((user) => {
    idToHouseMap.set(user.id, user.house);
  });

  const housePlacard = new Map<HouseId, { members: number; totalXp: number }>();

  for (const [classUserId, classUserData] of Object.entries(classData.users ?? {})) {
    if (idToHouseMap.has(classUserId)) {
      const house = idToHouseMap.get(classUserId)!;

      const currentStats = housePlacard.get(house) ?? { members: 0, totalXp: 0 };
      currentStats.members += 1;
      currentStats.totalXp += classUserData.progress.xp;

      housePlacard.set(house, currentStats);
    }
  }

  const finalStats: HouseStats[] = Array.from(housePlacard.entries()).map(
    ([houseId, data]) => ({
      houseId,
      members: data.members,
      totalXp: data.totalXp,
      avgXp: data.members > 0 ? Math.round(data.totalXp / data.members) : 0,
    })
  );

  finalStats.sort((a, b) => b.totalXp - a.totalXp);
  return finalStats;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const classId = searchParams.get('classId');

    if (!classId) {
      return NextResponse.json({ error: "O 'classId' é obrigatório." }, { status: 400 });
    }

    const [clazz, allUsers] = await Promise.all([
      globalRepositories.classes.findById(classId),
      globalRepositories.users.all(),
    ]);

    if (!clazz) {
      return NextResponse.json({ error: `Turma '${classId}' não encontrada.` }, { status: 404 });
    }

    const stats = calculateStrictRanking(clazz, allUsers);
    return NextResponse.json(stats);
  } catch (error) {
    console.error('Falha crítica ao calcular o ranking das casas:', error);
    return NextResponse.json({ error: 'Não foi possível conjurar o ranking.' }, { status: 500 });
  }
}
