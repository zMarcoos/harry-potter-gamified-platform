import { z } from "zod/v4";
import { now } from "@/lib/core/utils/utils";
import { LangSchema, RoleSchema, ThemeSchema } from "./common.type";
import { HouseId, HouseIdSchema } from "./house.type";

export const UserProfileSchema = z.object({
  avatar: z.string().min(1),
  name: z.string().min(1),
});

export const UserPreferencesSchema = z.object({
  language: LangSchema.default("pt-BR"),
  notifications: z.boolean().default(true),
  theme: ThemeSchema.default("dark"),
});

export const UserActivitySchema = z.object({
  createdAt: z.coerce.date().default(now()),
  isActive: z.boolean().default(false),
  lastSeen: z.coerce.date().default(now()),
});

export const BaseUserSchema = z.object({
  id: z.string(),
  email: z.email(),
  role: RoleSchema,
  house: HouseIdSchema,
  profile: UserProfileSchema,
  activity: UserActivitySchema,
  preferences: UserPreferencesSchema,
  enrollments: z.array(z.string()).default([]),
});

export const ServerUserSchema = BaseUserSchema.extend({
  auth: z.object({
    password: z.string().min(6),
  }),
});

export const ClientUserSchema = BaseUserSchema;
export const CreateUserSchema = ServerUserSchema.omit({ id: true });

export const UserSessionSchema = z.object({
  expiresAt: z.number(),
  token: z.string(),
  user: ClientUserSchema,
});

export const UserProgressSchema = z.object({
  achievements: z.array(z.string()).default([]),
  currencies: z.object({
    galleons: z.number().int().default(100),
    gems: z.number().int().default(0),
  }),
  level: z.number().int().nonnegative().default(0),
  nextLevelXp: z.number().int().nonnegative().default(0),
  streak: z.number().int().nonnegative().default(0),
  xp: z.number().int().nonnegative().default(0),
});

export const UserReferencesSchema = z.object({
  forumPosts: z.array(z.string()).default([]),
  socialPosts: z.array(z.string()).default([]),
});

export const UserQuizStatSchema = z.object({
  attempts: z.number().int().min(0),
  best: z.number().int().min(0).max(100),
  completedAt: z.coerce.date(),
});

export const UserMissionStatSchema = z.object({
  completedAt: z.coerce.date().optional(),
  status: z.enum(["done", "pending", "in_progress"]).default("pending"),
});

const ClassCurrencySchema = z.object({
  galleons: z.number().int().nonnegative(),
  gems: z.number().int().nonnegative(),
});

const ClassProgressSchema = z.object({
  xp: z.number().int().nonnegative(),
  level: z.number().int().nonnegative(),
  streak: z.number().int().nonnegative(),
  currencies: ClassCurrencySchema,
});

const ClassCompletedQuizEntrySchema = z.object({
  attempts: z.number().int().positive(),
  bestScore: z.number().int().min(0).max(100),
  completedAt: z.coerce.date().default(now()),
});
const ClassCompletedQuizzesSchema = z.record(z.string(), ClassCompletedQuizEntrySchema);

const ClassMissionProgressEntrySchema = z.union([
  z.object({
    status: z.literal("completed"),
    completedAt: z.coerce.date().optional(),
  }),
  z.object({
    status: z.literal("in_progress"),
    currentValue: z.number().int().nonnegative().optional(),
  }),
]);
const ClassMissionProgressSchema = z.record(z.string(), ClassMissionProgressEntrySchema);

export const ClassUserSchema = z.object({
  progress: ClassProgressSchema,
  completedQuizzes: ClassCompletedQuizzesSchema,
  missionProgress: ClassMissionProgressSchema,
  unlockedAchievements: z.array(z.string()),
  inventory: z.array(z.string()),
});

export type CreateUser = z.infer<typeof CreateUserSchema>;
export type ClassUser = z.infer<typeof ClassUserSchema>;
export type ServerUser = z.infer<typeof ServerUserSchema>;
export type ClientUser = z.infer<typeof ClientUserSchema>;
export type UserSession = z.infer<typeof UserSessionSchema>;

export type UserRanking = {
  userId: string;
  xp: number;
  level: number;
  streak: number;
  galleons: number;
  gems: number;
};

export type EnrichedUserRanking = UserRanking & {
  name: string;
  avatar: string;
  house: HouseId;
};
