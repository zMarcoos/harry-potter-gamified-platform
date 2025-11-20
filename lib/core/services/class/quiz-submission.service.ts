import { globalRepositories, type ClassEntity } from '@/lib/core/repositories';
import type { ClassUser } from '@/lib/core/types/user.type';
import type { QuizQuestion } from '@/lib/core/types/quiz.type';
import { now } from '../../utils/utils';

const SCORE_THRESHOLD_FOR_REWARDS = 70;

function calculateBonuses(
  answers: (number | null)[],
  questions: QuizQuestion[],
  baseXp: number,
  score: number,
) {
  let comboXp = 0;
  let performanceXp = 0;

  let maxCombo = 0;
  let currentCombo = 0;

  for (let index = 0; index < questions.length; index++) {
    if (questions[index].correctAnswer === answers[index]) {
      currentCombo++;
    } else {
      maxCombo = Math.max(maxCombo, currentCombo);
      currentCombo = 0;
    }
  }

  maxCombo = Math.max(maxCombo, currentCombo);

  if (maxCombo >= 10) {
    comboXp = Math.round(baseXp * 0.5);
  } else if (maxCombo >= 5) {
    comboXp = Math.round(baseXp * 0.3);
  } else if (maxCombo >= 3) {
    comboXp = Math.round(baseXp * 0.2);
  }

  if (score === 100) {
    performanceXp = Math.round(baseXp * 0.5);
  } else if (score >= 90) {
    performanceXp = Math.round(baseXp * 0.25);
  } else if (score >= 80) {
    performanceXp = Math.round(baseXp * 0.1);
  }

  return { comboXp, performanceXp };
}

export const quizSubmissionService = {
  async submitAttempt(
    classId: string,
    userId: string,
    quizId: string,
    answers: (number | null)[],
  ) {
    let result: {
      score: number;
      attempts: number;
      bestScore: number;
      xpGained: number;
      galleonsGained: number;
      correctAnswers: number;
      comboBonus: number;
      performanceBonus: number;
      isFirstAttempt: boolean;
    } | null = null;

    const updatedClass = await globalRepositories.classes.update(
      classId,
      (clazz) => {
        if (!clazz) throw new Error(`Turma '${classId}' não encontrada.`);

        const quiz = clazz.quizzes?.find((quiz) => quiz.id === quizId);
        if (!quiz) throw new Error(`Quiz '${quizId}' não encontrado.`);

        const user = clazz.users?.[userId];
        if (!user)
          throw new Error(`Usuário '${userId}' não encontrado na turma.`);

        const correctCount = quiz.questions.filter(
          (quiz, index) => quiz.correctAnswer === answers[index],
        ).length;
        const score = Math.round((correctCount / quiz.questions.length) * 100);

        const prevStats = user.completedQuizzes?.[quizId];
        const isFirstAttempt = !prevStats;
        const attempts = (prevStats?.attempts ?? 0) + 1;
        const bestScore = Math.max(prevStats?.bestScore ?? 0, score);
        const meetsThreshold = score >= SCORE_THRESHOLD_FOR_REWARDS;

        let xpGained = 0;
        let galleonsGained = 0;
        let comboBonus = 0;
        let performanceBonus = 0;

        if (isFirstAttempt && meetsThreshold) {
          const bonuses = calculateBonuses(
            answers,
            quiz.questions,
            quiz.xpReward,
            score,
          );
          comboBonus = bonuses.comboXp;
          performanceBonus = bonuses.performanceXp;

          xpGained = quiz.xpReward + comboBonus + performanceBonus;
          galleonsGained = quiz.galleonReward;
        }

        type QuizStat = ClassUser['completedQuizzes'][string];
        const updatedQuizStat: QuizStat = {
          attempts,
          bestScore,
          completedAt: now(),
        };

        const newCompletedQuizzes: ClassUser['completedQuizzes'] = {
          ...user.completedQuizzes,
          [quizId]: updatedQuizStat,
        };

        const newMissionProgress: ClassUser['missionProgress'] = {
          ...user.missionProgress,
        };

        if (isFirstAttempt && meetsThreshold) {
          for (const mission of clazz.missions ?? []) {
            if (mission.objective?.type !== 'complete_quiz') continue;
            const current = newMissionProgress[mission.id];
            if (current?.status === 'completed') continue;

            const previousValue =
              current && current.status === 'in_progress'
                ? current.currentValue ?? 0
                : 0;
            const nextValue = previousValue + 1;
            const target = mission.objective.count ?? 1;

            if (nextValue >= target) {
              newMissionProgress[mission.id] = {
                status: 'completed',
                completedAt: now(),
              };
            } else {
              newMissionProgress[mission.id] = {
                status: 'in_progress',
                currentValue: nextValue,
              };
            }
          }
        }

        const newUser: ClassUser = {
          ...user,
          completedQuizzes: newCompletedQuizzes,
          missionProgress: newMissionProgress,
          progress: {
            ...user.progress,
            xp: user.progress.xp + xpGained,
            currencies: {
              ...user.progress.currencies,
              galleons: user.progress.currencies.galleons + galleonsGained,
            },
          },
        };

        const updatedUsers: ClassEntity['users'] = {
          ...clazz.users,
          [userId]: newUser,
        };

        result = {
          score,
          attempts,
          bestScore,
          xpGained: xpGained,
          galleonsGained,
          correctAnswers: correctCount,
          comboBonus,
          performanceBonus,
          isFirstAttempt,
        };

        return { users: updatedUsers };
      },
    );

    if (!updatedClass)
      throw new Error(`Turma '${classId}' não encontrada para atualização.`);
    if (!result) throw new Error('Falha ao submeter quiz.');

    return result;
  },
};
