'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { jsonFetch } from '@/lib/core/utils/api';
import type { EnrichedQuiz } from './use-potions';
import type { ClientUser } from '@/lib/core/types/user.type';

interface QuizSubmissionResults {
  score: number;
  xpGained: number;
  galleonsGained: number;
  attempts: number;
  bestScore: number;
  correctAnswers: number;
  comboBonus: number;
  performanceBonus: number;
  isFirstAttempt: boolean;
}

export interface FinalQuizResults extends QuizSubmissionResults {
  totalQuestions: number;
  timeSpent: number;
}

export function useQuizRunner(
  quiz: EnrichedQuiz | null,
  classId: string,
  currentUser: ClientUser | null,
  onFinish: (results: FinalQuizResults) => void,
) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<(number | null)[]>([]);
  const [timeLeft, setTimeLeft] = useState(
    quiz?.timeLimit ? Math.floor(quiz.timeLimit / 1000) : 0,
  );
  const startTimeReference = useRef<number>(0);

  const submitQuizMutation = useMutation<
    QuizSubmissionResults,
    Error,
    (number | null)[]
  >({
    mutationFn: (submittedAnswers) =>
      jsonFetch<QuizSubmissionResults>('/api/quizzes/submit', {
        method: 'POST',
        body: JSON.stringify({
          classId,
          userId: currentUser!.id,
          quizId: quiz!.id,
          answers: submittedAnswers,
        }),
      }),
    onSuccess: (apiResults) => {
      const timeSpent = Math.floor(
        (Date.now() - startTimeReference.current) / 1000,
      );
      const limitInSeconds = quiz?.timeLimit
        ? Math.floor(quiz.timeLimit / 1000)
        : 0;
      const finalTime = timeSpent > limitInSeconds ? limitInSeconds : timeSpent;

      onFinish({
        ...apiResults,
        totalQuestions: quiz?.questions.length ?? 0,
        timeSpent: finalTime,
      });

      const meetsThreshold = apiResults.score >= 70;
      if (!apiResults.isFirstAttempt) {
        toast.info('Modo de Prática', {
          description:
            'Você já completou este quiz. XP e Galeões não são ganhos em re-tentativas.',
        });
      } else if (!meetsThreshold) {
        toast.info('Pontuação abaixo de 70%', {
          description: 'Você não ganhou XP ou Galeões desta vez. Estude mais!',
        });
      }
    },
    onError: (error) => {
      toast.error('Falha ao submeter o quiz.', {
        description: error.message || 'Tente novamente.',
      });
    },
    onSettled: () => {
      setTimeLeft(0);
    },
  });

  const triggerSubmit = useCallback(
    (currentAnswers: (number | null)[]) => {
      if (submitQuizMutation.isPending || submitQuizMutation.isSuccess) return;
      submitQuizMutation.mutate(currentAnswers);
    },
    [submitQuizMutation],
  );

  useEffect(() => {
    if (quiz) {
      setTimeLeft(quiz.timeLimit ? Math.floor(quiz.timeLimit / 1000) : 0);
      setCurrentQuestionIndex(0);
      setUserAnswers(Array(quiz.questions.length).fill(null));
      startTimeReference.current = Date.now();
    }
  }, [quiz]);

  useEffect(() => {
    let timerId: NodeJS.Timeout | undefined;
    if (
      timeLeft > 0 &&
      !submitQuizMutation.isPending &&
      !submitQuizMutation.isSuccess
    ) {
      timerId = setTimeout(() => setTimeLeft((time) => time - 1), 1000);
    } else if (timeLeft === 0 && quiz && !submitQuizMutation.isPending && !submitQuizMutation.isSuccess) {
      toast.warning("Tempo esgotado!", { description: "Enviando suas respostas..." });
      triggerSubmit(userAnswers);
    }

    return () => clearTimeout(timerId);
  }, [timeLeft, quiz, triggerSubmit, userAnswers, submitQuizMutation.isPending, submitQuizMutation.isSuccess]);

  const selectAnswer = (questionIndex: number, answerIndex: number) => {
    setUserAnswers((previousAnswers) => {
      const newAnswers = [...previousAnswers];
      newAnswers[questionIndex] = answerIndex;
      return newAnswers;
    });
  };

  const goToNextQuestion = () => {
    if (quiz && currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex((previousIndex) => previousIndex + 1);
    } else {
      triggerSubmit(userAnswers);
    }
  };

  const currentQuestionData = quiz?.questions[currentQuestionIndex];
  const quizProgress = quiz
    ? ((currentQuestionIndex + 1) / quiz.questions.length) * 100
    : 0;
  const selectedAnswerForCurrentQuestion = userAnswers[currentQuestionIndex];

  const explicitlySubmitQuiz = () => {
    triggerSubmit(userAnswers);
  };

  return {
    currentQuestion: currentQuestionData,
    currentQuestionIndex,
    totalQuestions: quiz?.questions.length || 0,
    timeLeft,
    progress: quizProgress,
    selectedAnswerForCurrent: selectedAnswerForCurrentQuestion,
    isSubmitting: submitQuizMutation.isPending,
    selectAnswer,
    nextQuestion: goToNextQuestion,
    submitQuiz: explicitlySubmitQuiz,
  };
}
