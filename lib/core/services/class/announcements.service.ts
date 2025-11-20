import { globalRepositories } from '@/lib/core/repositories';
import {
  Announcement,
  AnnouncementSchema,
} from '@/lib/core/types/announcement.type';
import { randomUUID } from 'node:crypto';
import { getClassOrThrow } from '../../utils/class';

function findAnnouncementIndex(items: Announcement[], id: string): number {
  return items.findIndex((a) => a.id === id);
}

export const announcementService = {
  async list(classId: string): Promise<Announcement[]> {
    const clazz = await getClassOrThrow(classId);
    const items = clazz.announcements ?? [];
    return [...items].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  },

  async getById(
    classId: string,
    announcementId: string,
  ): Promise<Announcement | null> {
    const clazz = await getClassOrThrow(classId);
    return (
      (clazz.announcements ?? []).find((a) => a.id === announcementId) ?? null
    );
  },

  async create(
    classId: string,
    input: Omit<
      Announcement,
      'id' | 'createdAt' | 'reactions' | 'readBy' | 'views'
    > & { publishedAt?: Date | string | null },
  ): Promise<Announcement> {
    const candidate: Announcement = AnnouncementSchema.parse({
      id: randomUUID(),
      ...input,
      createdAt: new Date(),
    });

    await globalRepositories.classes.update(classId, (clazz) => {
      if (!clazz) throw new Error(`Turma '${classId}' não encontrada.`);
      const next = [candidate, ...(clazz.announcements ?? [])];
      return { announcements: next };
    });

    return candidate;
  },

  async update(
    classId: string,
    announcementId: string,
    updates: Partial<
      Pick<
        Announcement,
        | 'title'
        | 'content'
        | 'type'
        | 'category'
        | 'priority'
        | 'tags'
        | 'isPublished'
        | 'isPinned'
        | 'isDraft'
        | 'allowComments'
        | 'allowReactions'
        | 'publishedAt'
        | 'expiresAt'
      >
    >,
  ): Promise<Announcement> {
    let updatedAnnouncement: Announcement | null = null;

    const updatedClass = await globalRepositories.classes.update(
      classId,
      (clazz) => {
        if (!clazz) throw new Error(`Turma '${classId}' não encontrada.`);
        const items = clazz.announcements ?? [];
        const idx = findAnnouncementIndex(items, announcementId);
        if (idx === -1)
          throw new Error(`Aviso '${announcementId}' não encontrado.`);

        const current = items[idx];
        let publishedAt = updates.publishedAt ?? current.publishedAt;
        if (updates.isPublished === true && !publishedAt) {
          publishedAt = new Date();
        }

        const candidate: Announcement = AnnouncementSchema.parse({
          ...current,
          ...updates,
          publishedAt,
        });
        updatedAnnouncement = candidate;

        const next = [...items];
        next[idx] = candidate;
        return { announcements: next };
      },
    );

    if (!updatedClass)
      throw new Error(`Turma '${classId}' não encontrada para atualização.`);
    if (!updatedAnnouncement) throw new Error('Falha ao atualizar aviso.');

    return updatedAnnouncement;
  },

  async remove(classId: string, announcementId: string): Promise<void> {
    await globalRepositories.classes.update(classId, (clazz) => {
      if (!clazz) throw new Error(`Turma '${classId}' não encontrada.`);
      const items = clazz.announcements ?? [];
      const exists = items.some((a) => a.id === announcementId);
      if (!exists) throw new Error(`Aviso '${announcementId}' não encontrado.`);

      const next = items.filter((a) => a.id !== announcementId);
      return { announcements: next };
    });
  },

  async togglePin(
    classId: string,
    announcementId: string,
  ): Promise<{ isPinned: boolean }> {
    let result: { isPinned: boolean } | null = null;

    const updatedClass = await globalRepositories.classes.update(
      classId,
      (clazz) => {
        if (!clazz) throw new Error(`Turma '${classId}' não encontrada.`);
        const items = clazz.announcements ?? [];
        const idx = findAnnouncementIndex(items, announcementId);
        if (idx === -1)
          throw new Error(`Aviso '${announcementId}' não encontrado.`);

        const current = items[idx];
        const candidate: Announcement = AnnouncementSchema.parse({
          ...current,
          isPinned: !current.isPinned,
        });

        const next = [...items];
        next[idx] = candidate;
        result = { isPinned: candidate.isPinned };
        return { announcements: next };
      },
    );

    if (!updatedClass)
      throw new Error(`Turma '${classId}' não encontrada para atualização.`);
    if (!result) throw new Error('Falha ao pinar aviso.');

    return result;
  },

  async setPublished(
    classId: string,
    announcementId: string,
    publish: boolean,
  ): Promise<Announcement> {
    let updatedAnnouncement: Announcement | null = null;

    const updatedClass = await globalRepositories.classes.update(
      classId,
      (clazz) => {
        if (!clazz) throw new Error(`Turma '${classId}' não encontrada.`);
        const items = clazz.announcements ?? [];
        const idx = findAnnouncementIndex(items, announcementId);
        if (idx === -1)
          throw new Error(`Aviso '${announcementId}' não encontrado.`);

        const current = items[idx];
        const candidate: Announcement = AnnouncementSchema.parse({
          ...current,
          isPublished: publish,
          isDraft: publish ? false : current.isDraft,
          publishedAt: publish ? new Date() : current.publishedAt ?? null,
        });
        updatedAnnouncement = candidate;

        const next = [...items];
        next[idx] = candidate;
        return { announcements: next };
      },
    );

    if (!updatedClass)
      throw new Error(`Turma '${classId}' não encontrada para atualização.`);
    if (!updatedAnnouncement) throw new Error('Falha ao publicar aviso.');

    return updatedAnnouncement;
  },

  async addReaction(
    classId: string,
    announcementId: string,
    kind: keyof Announcement['reactions'],
    delta: 1 | -1 = 1,
  ): Promise<number> {
    let nextCountResult: number | null = null;

    const updatedClass = await globalRepositories.classes.update(
      classId,
      (clazz) => {
        if (!clazz) throw new Error(`Turma '${classId}' não encontrada.`);
        const items = clazz.announcements ?? [];
        const idx = findAnnouncementIndex(items, announcementId);
        if (idx === -1)
          throw new Error(`Aviso '${announcementId}' não encontrado.`);

        const current = items[idx];
        const currentCount = current.reactions[kind] ?? 0;
        const nextCount = Math.max(0, currentCount + delta);
        nextCountResult = nextCount;

        const candidate: Announcement = AnnouncementSchema.parse({
          ...current,
          reactions: { ...current.reactions, [kind]: nextCount },
        });

        const next = [...items];
        next[idx] = candidate;
        return { announcements: next };
      },
    );

    if (!updatedClass)
      throw new Error(`Turma '${classId}' não encontrada para atualização.`);
    if (nextCountResult === null) throw new Error('Falha ao adicionar reação.');

    return nextCountResult;
  },

  async markAsRead(
    classId: string,
    announcementId: string,
    userId: string,
  ): Promise<void> {
    await globalRepositories.classes.update(classId, (clazz) => {
      if (!clazz) throw new Error(`Turma '${classId}' não encontrada.`);
      const items = clazz.announcements ?? [];
      const idx = findAnnouncementIndex(items, announcementId);
      if (idx === -1)
        throw new Error(`Aviso '${announcementId}' não encontrado.`);

      const current = items[idx];
      const already = current.readBy.some((r) => r.userId === userId);
      if (already) return {};

      const candidate: Announcement = AnnouncementSchema.parse({
        ...current,
        readBy: [...current.readBy, { userId, readAt: new Date() }],
      });

      const next = [...items];
      next[idx] = candidate;
      return { announcements: next };
    });
  },

  async incrementViews(
    classId: string,
    announcementId: string,
  ): Promise<void> {
    await globalRepositories.classes.update(classId, (clazz) => {
      if (!clazz) throw new Error(`Turma '${classId}' não encontrada.`);
      const items = clazz.announcements ?? [];
      const idx = findAnnouncementIndex(items, announcementId);
      if (idx === -1)
        throw new Error(`Aviso '${announcementId}' não encontrado.`);

      const current = items[idx];
      const candidate: Announcement = AnnouncementSchema.parse({
        ...current,
        views: (current.views ?? 0) + 1,
      });

      const next = [...items];
      next[idx] = candidate;
      return { announcements: next };
    });
  },
};
