import { z } from "zod/v4";

export const SocialCommentSchema = z.object({
  id: z.string(),
  authorId: z.string(),
  content: z.string(),
  timestamp: z.coerce.date(),
});

export const SocialPostSchema = z.object({
  id: z.string(),
  authorId: z.string(),
  content: z.string(),
  timestamp: z.coerce.date(),
  likes: z.array(z.string()).default([]),
  comments: z.array(SocialCommentSchema).default([]),
});

export const CreateSocialPostInputSchema = SocialPostSchema.omit({ id: true });
export const UpdateSocialPostInputSchema = SocialPostSchema.omit({ id: true }).partial();

export type SocialPost = z.infer<typeof SocialPostSchema>;
export type SocialComment = z.infer<typeof SocialCommentSchema>;
export type CreateSocialPostInput = z.infer<typeof CreateSocialPostInputSchema>;
export type UpdateSocialPostInput = z.infer<typeof UpdateSocialPostInputSchema>;

export type EnrichedSocialPost = SocialPost & {
  author: {
    name: string;
    avatar: string;
  };
};
