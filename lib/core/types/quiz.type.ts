import { z } from "zod/v4";

export const QuizDifficultySchema = z.enum(["beginner", "intermediate", "advanced"]);

export const QuizQuestionSchema = z
  .object({
    id: z.string(),
    question: z.string(),
    options: z.array(z.string()).min(1),
    correctAnswer: z.number().int().nonnegative(),
    explanation: z.string().optional(),
  })
  .refine(
    (val) => val.correctAnswer >= 0 && val.correctAnswer < val.options.length,
    {
      message: "`correctAnswer` deve ser um índice válido dentro de `options`.",
      path: ["correctAnswer"],
    }
  );

export const QuizSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  difficulty: QuizDifficultySchema,
  xpReward: z.number().int().nonnegative(),
  galleonReward: z.number().int().nonnegative(),
  unlocksAchievementId: z.string().nullable(),
  questions: z.array(QuizQuestionSchema).min(1),
  timeLimit: z.number().int().positive()
});

export const CreateQuizInputSchema = QuizSchema.omit({ id: true });
export const UpdateQuizInputSchema = QuizSchema.omit({ id: true }).partial();

export type Quiz = z.infer<typeof QuizSchema>;
export type QuizQuestion = z.infer<typeof QuizQuestionSchema>;
export type CreateQuizInput = z.infer<typeof CreateQuizInputSchema>;
export type UpdateQuizInput = z.infer<typeof UpdateQuizInputSchema>;
