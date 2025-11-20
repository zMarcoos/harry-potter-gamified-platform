'use client';

import { useState, useCallback, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { jsonFetch } from '@/lib/core/utils/api';
import type { Quiz } from '@/lib/core/types/quiz.type';
import type { ClientUser, ClassUser } from '@/lib/core/types/user.type';
import type { FinalQuizResults } from './use-quiz-runner';

export type EnrichedQuiz = Quiz & {
  isCompleted: boolean;
  bestScore?: number;
  scoreData?: ClassUser['completedQuizzes'][string];
};

type QuizFlowStatus = 'list' | 'running' | 'summary' | 'completedSummary';

const potionsKeys = {
  quizzes: (classId: string) => ['potionsQuizzes', classId] as const,
};

export function usePotions(classId: string, currentUser: ClientUser | null) {
  const queryClient = useQueryClient();
  const [currentStatus, setCurrentStatus] = useState<QuizFlowStatus>('list');
  const [selectedQuiz, setSelectedQuiz] = useState<EnrichedQuiz | null>(null);
  const [lastQuizResults, setLastQuizResults] = useState<FinalQuizResults | null>(
    null,
  );

  const {
    data: quizzes,
    isLoading,
    error,
    refetch: refetchQuizzes,
  } = useQuery<EnrichedQuiz[], Error>({
    queryKey: potionsKeys.quizzes(classId),
    queryFn: () =>
      jsonFetch<EnrichedQuiz[]>(`/api/quizzes?classId=${classId}`),
    enabled: !!classId && !!currentUser,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });

  useEffect(() => {
    if (error) {
      toast.error('Não foi possível carregar os quizzes de Poções.');
    }
  }, [error]);

  const startQuiz = useCallback((quizToStart: EnrichedQuiz) => {
    if (quizToStart.isCompleted && !quizToStart.questions?.length) {
      toast.error("Este quiz já foi completado e não pode ser refeito.");
      return;
    }
    setSelectedQuiz(quizToStart);
    setCurrentStatus('running');
    setLastQuizResults(null);
  }, []);

  const showCompletedSummary = useCallback((completedQuiz: EnrichedQuiz) => {
    setSelectedQuiz(completedQuiz);
    setCurrentStatus('completedSummary');
    setLastQuizResults(null);
  }, []);

  const handleQuizFinish = useCallback(
    (results: FinalQuizResults) => {
      setLastQuizResults(results);
      setCurrentStatus('summary');
      queryClient.invalidateQueries({
        queryKey: potionsKeys.quizzes(classId),
      });
      queryClient.invalidateQueries({ queryKey: ['me'] });
      queryClient.invalidateQueries({ queryKey: ['classInfo', classId] });
    },
    [queryClient, classId],
  );

  const returnToList = useCallback(() => {
    setSelectedQuiz(null);
    setCurrentStatus('list');
    setLastQuizResults(null);
  }, []);

  return {
    quizzes: quizzes ?? [],
    isLoading,
    status: currentStatus,
    selectedQuiz,
    lastResults: lastQuizResults,
    startQuiz,
    showCompletedSummary,
    handleQuizFinish,
    goToList: returnToList,
  };
}

