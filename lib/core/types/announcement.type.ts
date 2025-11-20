import { z } from "zod/v4";

export const AnnouncementAttachmentSchema = z.object({
  name: z.string(),
  url: z.url(),
  type: z.string(),
  size: z.number().int().nonnegative(),
});

export const AnnouncementReactionsSchema = z.object({
  like: z.number().int().nonnegative(),
  love: z.number().int().nonnegative(),
  wow: z.number().int().nonnegative(),
  sad: z.number().int().nonnegative(),
  angry: z.number().int().nonnegative(),
});

export const AnnouncementReadBySchema = z.object({
  userId: z.string(),
  readAt: z.coerce.date(),
});

export const AnnouncementPrioritySchema = z.enum(["high", "medium", "low"]);
export const AnnouncementTypeSchema = z.enum(["general", "event", "update"]);

export const AnnouncementSchema = z.object({
  id: z.string(),
  authorId: z.string(),
  title: z.string(),
  content: z.string(),
  createdAt: z.coerce.date(),
  isPinned: z.boolean().default(false),

  type: AnnouncementTypeSchema.default("general"),
  category: z.string().optional(),
  priority: AnnouncementPrioritySchema.default("medium"),
  tags: z.array(z.string()).default([]),

  isPublished: z.boolean().default(true),
  isDraft: z.boolean().default(false),
  allowComments: z.boolean().default(true),
  allowReactions: z.boolean().default(true),

  publishedAt: z.coerce.date().optional(),
  expiresAt: z.coerce.date().nullable().optional(),

  attachments: z.array(AnnouncementAttachmentSchema).default([]),
  reactions: AnnouncementReactionsSchema.default({
    like: 0,
    love: 0,
    wow: 0,
    sad: 0,
    angry: 0,
  }),
  readBy: z.array(AnnouncementReadBySchema).default([]),
  views: z.number().int().nonnegative().default(0),
});

const CreateAnnouncementOptional = AnnouncementSchema.omit({
  id: true,
  createdAt: true,
}).partial();

export const CreateAnnouncementInputSchema = z.intersection(
  CreateAnnouncementOptional,
  z.object({
    authorId: z.string(),
    title: z.string(),
    content: z.string(),
  })
);

/** UPDATE: tudo opcional, sem poder trocar id/authorId/createdAt */
export const UpdateAnnouncementInputSchema = AnnouncementSchema.omit({
  id: true,
  authorId: true,
  createdAt: true,
}).partial();

export type Announcement = z.infer<typeof AnnouncementSchema>;
export type CreateAnnouncementInput = z.infer<typeof CreateAnnouncementInputSchema>;
export type UpdateAnnouncementInput = z.infer<typeof UpdateAnnouncementInputSchema>;
export type AnnouncementAttachment = z.infer<typeof AnnouncementAttachmentSchema>;
export type AnnouncementReadBy = z.infer<typeof AnnouncementReadBySchema>;
