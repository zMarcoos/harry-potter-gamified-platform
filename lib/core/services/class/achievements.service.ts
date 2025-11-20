import { globalRepositories } from '@/lib/core/repositories';
import {
  AchievementSchema,
  type Achievement,
} from '@/lib/core/types/achievement.type';
import { getClassOrThrow } from '../../utils/class';

export const achievementsService = {
  async getAll(classId: string): Promise<Achievement[]> {
    const clazz = await getClassOrThrow(classId);
    return clazz.achievements ?? [];
  },

  async getOne(
    classId: string,
    achievementId: string,
  ): Promise<Achievement | null> {
    const clazz = await getClassOrThrow(classId);
    return (
      clazz.achievements?.find(
        (achievement) => achievement.id === achievementId,
      ) ?? null
    );
  },

  async create(classId: string, data: Achievement): Promise<Achievement> {
    const newAchievement = AchievementSchema.parse(data);

    await globalRepositories.classes.update(classId, (clazz) => {
      if (!clazz) throw new Error(`Turma '${classId}' não encontrada.`);
      const achievements = [...(clazz.achievements ?? []), newAchievement];
      return { achievements };
    });

    return newAchievement;
  },

  async update(
    classId: string,
    achievementId: string,
    patch: Partial<Achievement>,
  ): Promise<Achievement> {
    let updatedAchievement: Achievement | null = null;

    const updatedClass = await globalRepositories.classes.update(
      classId,
      (clazz) => {
        if (!clazz) throw new Error(`Turma '${classId}' não encontrada.`);

        let found = false;
        const achievements = (clazz.achievements ?? []).map((achievement) => {
          if (achievement.id === achievementId) {
            found = true;
            const updated = { ...achievement, ...patch };
            updatedAchievement = AchievementSchema.parse(updated);
            return updatedAchievement;
          }
          return achievement;
        });

        if (!found)
          throw new Error(`Conquista '${achievementId}' não encontrada.`);

        return { achievements };
      },
    );

    if (!updatedClass)
      throw new Error(`Turma '${classId}' não encontrada para atualização.`);
    if (!updatedAchievement) throw new Error('Falha ao atualizar conquista.');

    return updatedAchievement;
  },

  async delete(classId: string, achievementId: string): Promise<void> {
    await globalRepositories.classes.update(classId, (clazz) => {
      if (!clazz) throw new Error(`Turma '${classId}' não encontrada.`);
      const filtered =
        clazz.achievements?.filter(
          (achievement) => achievement.id !== achievementId,
        ) ?? [];
      return { achievements: filtered };
    });
  },
};
