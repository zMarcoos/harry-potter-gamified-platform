import { z } from "zod/v4";

export const MissionObjectiveSchema = z.object({
  type: z.string(),
  count: z.number().int().positive().optional(),
});

export const MissionSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  icon: z.string(),
  xpReward: z.number().int().nonnegative(),
  galleonReward: z.number().int().nonnegative(),
  objective: MissionObjectiveSchema,
  unlocksAchievementId: z.string().nullable(),
});

export const CreateMissionInputSchema = MissionSchema.omit({ id: true });
export const UpdateMissionInputSchema = MissionSchema.omit({ id: true }).partial();

export type Mission = z.infer<typeof MissionSchema>;
export type MissionObjective = z.infer<typeof MissionObjectiveSchema>;
export type CreateMissionInput = z.infer<typeof CreateMissionInputSchema>;
export type UpdateMissionInput = z.infer<typeof UpdateMissionInputSchema>;
