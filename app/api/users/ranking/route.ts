import { NextRequest, NextResponse } from "next/server";
import { globalRepositories } from "@/lib/core/repositories";
import type { EnrichedUserRanking } from "@/lib/core/types/user.type";
import type { HouseId } from "@/lib/core/types/house.type";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const classId = searchParams.get("classId");
    if (!classId) {
      return NextResponse.json({ error: "classId é obrigatório" }, { status: 400 });
    }

    const clazz = await globalRepositories.classes.findById(classId);
    if (!clazz) {
      return NextResponse.json({ error: "Turma não encontrada" }, { status: 404 });
    }

    const studentPromises = Object.entries(clazz.users ?? {}).map(async ([userId, user]) => {
      const profileUser = await globalRepositories.users.findById(userId);

      if (!profileUser) {
        console.warn(`Perfil não encontrado para userId: ${userId} na turma ${classId}`);
        return null;
      }

      return {
        userId,
        xp: user.progress?.xp ?? 0,
        level: user.progress?.level ?? 0,
        streak: user.progress?.streak ?? 0,
        galleons: user.progress?.currencies?.galleons ?? 0,
        gems: user.progress?.currencies?.gems ?? 0,
        name: profileUser.profile.name,
        avatar: profileUser.profile.avatar,
        house: profileUser.house as HouseId,
      };
    });

    const resolvedStudents = await Promise.all(studentPromises);

    const students = resolvedStudents.filter((student): student is EnrichedUserRanking => student !== null);

    students.sort((a, b) => b.xp - a.xp);

    return NextResponse.json(students);

  } catch (err: any) {
    console.error("Erro na API de Ranking:", err);
    return NextResponse.json({ error: err?.message ?? "Erro ao obter ranking" }, { status: 500 });
  }
}
