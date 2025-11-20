import { globalRepositories } from '@/lib/core/repositories';
import { ClassUserSchema, type ClassUser } from '@/lib/core/types/user.type';

function mergeClassUser(
  existing: ClassUser,
  patch: Partial<ClassUser>,
): ClassUser {
  const next: ClassUser = {
    ...existing,

    progress: {
      ...existing.progress,
      ...(patch.progress ?? {}),
      currencies: {
        ...existing.progress.currencies,
        ...(patch.progress?.currencies ?? {}),
      },
    },

    completedQuizzes: {
      ...existing.completedQuizzes,
      ...(patch.completedQuizzes ?? {}),
    },

    missionProgress: {
      ...existing.missionProgress,
      ...(patch.missionProgress ?? {}),
    },

    unlockedAchievements:
      patch.unlockedAchievements ?? existing.unlockedAchievements,

    inventory: patch.inventory ?? existing.inventory,
  };

  return ClassUserSchema.parse(next);
}

export const usersService = {
  async getAll(classId: string): Promise<Record<string, ClassUser>> {
    const clazz = await globalRepositories.classes.findById(classId);
    if (!clazz) throw new Error(`Turma '${classId}' não encontrada.`);
    return clazz.users ?? {};
  },

  async getOne(classId: string, userId: string): Promise<ClassUser | null> {
    const clazz = await globalRepositories.classes.findById(classId);
    if (!clazz) throw new Error(`Turma '${classId}' não encontrada.`);
    const snap = clazz.users?.[userId];
    return snap ? ClassUserSchema.parse(snap) : null;
  },

  async setOne(
    classId: string,
    userId: string,
    data: ClassUser,
  ): Promise<ClassUser> {
    const validated = ClassUserSchema.parse(data);

    const updatedClass = await globalRepositories.classes.update(
      classId,
      (clazz) => {
        if (!clazz) throw new Error(`Turma '${classId}' não encontrada.`);
        const users = { ...(clazz.users ?? {}), [userId]: validated };
        return { users };
      },
    );

    if (!updatedClass)
      throw new Error(`Turma '${classId}' não encontrada para atualização.`);
    return validated;
  },

  async patchOne(
    classId: string,
    userId: string,
    patch: Partial<ClassUser>,
  ): Promise<ClassUser> {
    let mergedUser: ClassUser | null = null;

    const updatedClass = await globalRepositories.classes.update(
      classId,
      (clazz) => {
        if (!clazz) throw new Error(`Turma '${classId}' não encontrada.`);
        const current = clazz.users?.[userId];
        if (!current)
          throw new Error(`Usuário '${userId}' não encontrado nesta turma.`);

        const merged = mergeClassUser(ClassUserSchema.parse(current), patch);
        mergedUser = merged;

        return {
          users: { ...(clazz.users ?? {}), [userId]: merged },
        };
      },
    );

    if (!updatedClass)
      throw new Error(`Turma '${classId}' não encontrada para atualização.`);
    if (!mergedUser) throw new Error('Falha ao mesclar usuário.');

    return mergedUser;
  },

  async upsertCompletedQuiz(
    classId: string,
    userId: string,
    quizId: string,
    stat: ClassUser['completedQuizzes'][string],
  ): Promise<ClassUser> {
    let nextUser: ClassUser | null = null;

    const updatedClass = await globalRepositories.classes.update(
      classId,
      (clazz) => {
        if (!clazz) throw new Error(`Turma '${classId}' não encontrada.`);
        const current = clazz.users?.[userId];
        if (!current)
          throw new Error(`Usuário '${userId}' não encontrado nesta turma.`);

        const next = mergeClassUser(ClassUserSchema.parse(current), {
          completedQuizzes: {
            [quizId]: stat,
          },
        });
        nextUser = next;

        return {
          users: { ...(clazz.users ?? {}), [userId]: next },
        };
      },
    );

    if (!updatedClass)
      throw new Error(`Turma '${classId}' não encontrada para atualização.`);
    if (!nextUser) throw new Error('Falha ao atualizar quiz.');

    return nextUser;
  },

  async upsertMissionProgress(
    classId: string,
    userId: string,
    missionId: string,
    entry: ClassUser['missionProgress'][string],
  ): Promise<ClassUser> {
    let nextUser: ClassUser | null = null;

    const updatedClass = await globalRepositories.classes.update(
      classId,
      (clazz) => {
        if (!clazz) throw new Error(`Turma '${classId}' não encontrada.`);
        const current = clazz.users?.[userId];
        if (!current)
          throw new Error(`Usuário '${userId}' não encontrado nesta turma.`);

        const next = mergeClassUser(ClassUserSchema.parse(current), {
          missionProgress: {
            [missionId]: entry,
          },
        });
        nextUser = next;

        return {
          users: { ...(clazz.users ?? {}), [userId]: next },
        };
      },
    );

    if (!updatedClass)
      throw new Error(`Turma '${classId}' não encontrada para atualização.`);
    if (!nextUser) throw new Error('Falha ao atualizar missão.');

    return nextUser;
  },

  async addAchievement(
    classId: string,
    userId: string,
    achievementId: string,
  ): Promise<ClassUser> {
    let nextUser: ClassUser | null = null;

    const updatedClass = await globalRepositories.classes.update(
      classId,
      (clazz) => {
        if (!clazz) throw new Error(`Turma '${classId}' não encontrada.`);
        const current = clazz.users?.[userId];
        if (!current)
          throw new Error(`Usuário '${userId}' não encontrado nesta turma.`);

        const already = current.unlockedAchievements?.includes(achievementId);
        const next = mergeClassUser(ClassUserSchema.parse(current), {
          unlockedAchievements: already
            ? current.unlockedAchievements
            : [...(current.unlockedAchievements ?? []), achievementId],
        });
        nextUser = next;

        return {
          users: { ...(clazz.users ?? {}), [userId]: next },
        };
      },
    );

    if (!updatedClass)
      throw new Error(`Turma '${classId}' não encontrada para atualização.`);
    if (!nextUser) throw new Error('Falha ao adicionar conquista.');

    return nextUser;
  },

  async addInventoryItem(
    classId: string,
    userId: string,
    itemId: string,
  ): Promise<ClassUser> {
    let nextUser: ClassUser | null = null;

    const updatedClass = await globalRepositories.classes.update(
      classId,
      (clazz) => {
        if (!clazz) throw new Error(`Turma '${classId}' não encontrada.`);
        const current = clazz.users?.[userId];
        if (!current)
          throw new Error(`Usuário '${userId}' não encontrado nesta turma.`);

        const hasItem = current.inventory?.includes(itemId);
        const next = mergeClassUser(ClassUserSchema.parse(current), {
          inventory: hasItem
            ? current.inventory
            : [...(current.inventory ?? []), itemId],
        });
        nextUser = next;

        return {
          users: { ...(clazz.users ?? {}), [userId]: next },
        };
      },
    );

    if (!updatedClass)
      throw new Error(`Turma '${classId}' não encontrada para atualização.`);
    if (!nextUser) throw new Error('Falha ao adicionar item.');

    return nextUser;
  },
};
