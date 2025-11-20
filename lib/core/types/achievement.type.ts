import { z } from "zod/v4";

export const AchievementSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  icon: z.string(),
  xpReward: z.number().int().nonnegative(),
});

export const CreateAchievementInputSchema = AchievementSchema.omit({ id: true });

export const UpdateAchievementInputSchema = AchievementSchema.omit({ id: true }).partial();

export type Achievement = z.infer<typeof AchievementSchema>;
export type CreateAchievementInput = z.infer<typeof CreateAchievementInputSchema>;
export type UpdateAchievementInput = z.infer<typeof UpdateAchievementInputSchema>;
