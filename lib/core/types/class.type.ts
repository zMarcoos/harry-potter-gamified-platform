import { z } from "zod/v4";
import { ClassUserSchema } from "./user.type";
import { ShopItemSchema } from "./shop.type";
import { QuizSchema } from "./quiz.type";
import { MissionSchema } from "./mission.type";
import { ForumPostSchema } from "./forum.type";
import { AnnouncementSchema } from "./announcement.type";
import { AchievementSchema } from "./achievement.type";
import { SocialPostSchema } from "./social.type";

const ProfessorProfileSchema = z.object({
  id: z.string(),
  name: z.string(),
  avatar: z.url(),
});

export const ClassDetailsSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  professorId: z.string(),
  isPrivate: z.boolean(),
  password: z.string().nullable(),
  isActive: z.boolean(),
  createdAt: z.coerce.date(),
});

export const ClassSchema = ClassDetailsSchema.extend({
  users: z.record(z.string(), ClassUserSchema).default({}),
  achievements: z.array(AchievementSchema),
  missions: z.array(MissionSchema),
  quizzes: z.array(QuizSchema),
  shop: z.array(ShopItemSchema),
  socialFeed: z.array(SocialPostSchema),
  forumPosts: z.array(ForumPostSchema),
  announcements: z.array(AnnouncementSchema),
});

export type Class = z.infer<typeof ClassSchema>;
export type ClassDetails = z.infer<typeof ClassDetailsSchema>;

export type EnrichedClass = Class & {
  professor: {
    name: string;
    avatar: string;
  };
};
