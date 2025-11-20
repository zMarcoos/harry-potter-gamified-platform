import { ClassEntity, globalRepositories } from "../repositories";

export async function getClassOrThrow(classId: string): Promise<ClassEntity> {
  const clazz = await globalRepositories.classes.findById(classId);
  if (!clazz) throw new Error(`Turma '${classId}' não encontrada.`);
  return clazz;
}
