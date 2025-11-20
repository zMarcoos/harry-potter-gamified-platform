import { z } from "zod/v4";

export const ForumDifficultySchema = z.enum(["beginner", "intermediate", "advanced"]);

export const ForumPostReplySchema = z.object({
  id: z.string(),
  authorId: z.string(),
  content: z.string(),
  createdAt: z.coerce.date(),
  isAccepted: z.boolean().optional(),
  likes: z.array(z.string()).default([]),
  code: z.string().optional(),
});

export const ForumPostSchema = z.object({
  id: z.string(),
  authorId: z.string(),
  title: z.string(),
  content: z.string(),
  category: z.string(),
  difficulty: ForumDifficultySchema,
  tags: z.array(z.string()).default([]),
  isPinned: z.boolean().default(false),
  isAnswered: z.boolean().default(false),
  views: z.number().int().nonnegative().default(0),
  likes: z.array(z.string()).default([]),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date().optional(),
  replies: z.array(ForumPostReplySchema).default([]),
  code: z.string().optional()
});

export const CreateForumPostInputSchema = ForumPostSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  views: true,
  likes: true,
}).extend({
  replies: z.array(ForumPostReplySchema).default([]),
});

export const UpdateForumPostInputSchema = ForumPostSchema.omit({
  id: true,
  authorId: true,
  createdAt: true,
}).partial();

export const CreatePostPayloadSchema = z.object({
  classId: z.string().min(1),
  authorId: z.string().min(1),
  title: z.string().min(3, "O título precisa ter pelo menos 3 caracteres."),
  content: z.string().min(10, "A descrição precisa ser mais detalhada."),
  category: z.string().min(1),
  difficulty: ForumDifficultySchema,
  code: z.string().optional(),
  tags: z.array(z.string()).optional().default([]),
});

export const CreateReplySchema = z.object({
  classId: z.string().min(1),
  authorId: z.string().min(1),
  content: z.string().min(1, "O conteúdo não pode estar vazio.").max(2000),
  code: z.string().optional(),
});

export type ForumPost = z.infer<typeof ForumPostSchema>;
export type ForumPostReply = z.infer<typeof ForumPostReplySchema>;
export type ForumDifficulty = z.infer<typeof ForumDifficultySchema>;
export type CreateForumPostInput = z.infer<typeof CreateForumPostInputSchema>;
export type UpdateForumPostInput = z.infer<typeof UpdateForumPostInputSchema>;

export type EnrichedForumPost = ForumPost & {
  author: {
    name: string;
    avatar: string;
  };
};

export type EnrichedForumPostReply = ForumPostReply & {
  author: {
    name: string;
    avatar: string;
  };
};
