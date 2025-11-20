import { globalRepositories } from '@/lib/core/repositories';
import { MissionSchema, type Mission } from '@/lib/core/types/mission.type';
import { getClassOrThrow } from '../../utils/class';

export const missionsService = {
  async getAll(classId: string): Promise<Mission[]> {
    const clazz = await getClassOrThrow(classId);
    return clazz.missions ?? [];
  },

  async getOne(classId: string, missionId: string): Promise<Mission | null> {
    const clazz = await getClassOrThrow(classId);
    return clazz.missions?.find((m) => m.id === missionId) ?? null;
  },

  async create(classId: string, data: Mission): Promise<Mission> {
    const newMission = MissionSchema.parse(data);

    await globalRepositories.classes.update(classId, (clazz) => {
      if (!clazz) throw new Error(`Turma '${classId}' não encontrada.`);
      const missions = [...(clazz.missions ?? []), newMission];
      return { missions };
    });

    return newMission;
  },

  async update(
    classId: string,
    missionId: string,
    patch: Partial<Mission>,
  ): Promise<Mission> {
    let updatedMission: Mission | null = null;

    const updatedClass = await globalRepositories.classes.update(
      classId,
      (clazz) => {
        if (!clazz) throw new Error(`Turma '${classId}' não encontrada.`);

        let found = false;
        const missions = (clazz.missions ?? []).map((m) => {
          if (m.id === missionId) {
            found = true;
            const updated = { ...m, ...patch };
            updatedMission = MissionSchema.parse(updated);
            return updatedMission;
          }
          return m;
        });

        if (!found) throw new Error(`Missão '${missionId}' não encontrada.`);

        return { missions };
      },
    );

    if (!updatedClass)
      throw new Error(`Turma '${classId}' não encontrada para atualização.`);
    if (!updatedMission) throw new Error('Falha ao atualizar missão.');

    return updatedMission;
  },

  async delete(classId: string, missionId: string): Promise<void> {
    await globalRepositories.classes.update(classId, (clazz) => {
      if (!clazz) throw new Error(`Turma '${classId}' não encontrada.`);
      const filtered = (clazz.missions ?? []).filter(
        (m) => m.id !== missionId,
      );
      return { missions: filtered };
    });
  },
};
