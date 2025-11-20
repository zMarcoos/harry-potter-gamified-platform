'use client';

import { BookOpen, CheckCircle, Clock, Coins, Star } from 'lucide-react';
import { Card, CardContent } from '@/lib/client/components/ui/card';
import { Badge } from '@/lib/client/components/ui/badge';
import { Button } from '@/lib/client/components/ui/button';
import { cn } from '@/lib/core/utils/utils';
import type { EnrichedQuiz } from '@/lib/client/hooks/potions/use-potions';

interface QuizListProps {
  quizzes: EnrichedQuiz[];
  onStartQuiz: (quiz: EnrichedQuiz) => void;
  onShowSummary: (quiz: EnrichedQuiz) => void;
}

const getDifficultyColorClass = (difficulty: string) => {
  switch (difficulty) {
    case 'beginner':
      return 'bg-green-500/80 border-green-500/30 text-green-100';
    case 'intermediate':
      return 'bg-yellow-500/80 border-yellow-500/30 text-yellow-100';
    case 'advanced':
      return 'bg-red-500/80 border-red-500/30 text-red-100';
    default:
      return 'bg-gray-500/80 border-gray-500/30 text-gray-100';
  }
};

const getDifficultyText = (difficulty: string) => {
  switch (difficulty) {
    case 'beginner':
      return 'Iniciante';
    case 'intermediate':
      return 'Intermediário';
    case 'advanced':
      return 'Avançado';
    default:
      return 'Desconhecido';
  }
};

export function QuizList({
  quizzes,
  onStartQuiz,
  onShowSummary,
}: QuizListProps) {
  return (
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr'>
      {quizzes.map((quiz) => (
        <Card
          key={quiz.id}
          className={cn(
            'card-hover border-accent/20 bg-card/60 backdrop-blur-sm',
            'flex flex-col h-full transition-all duration-300 group',
            quiz.isCompleted && 'ring-1 ring-green-500/50 bg-green-900/10',
            !quiz.isCompleted && 'magical-border',
          )}
        >
          <CardContent className='p-6 flex flex-col flex-grow'>
            <div className='relative text-center mb-4'>
              <div className='w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-primary/80 to-accent/80 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300'>
                <span className='text-4xl'>🧪</span>
              </div>
              {quiz.isCompleted && (
                <div className='absolute top-0 right-0 transform translate-x-1/3 -translate-y-1/3 w-7 h-7 bg-green-500 rounded-full flex items-center justify-center ring-2 ring-background'>
                  <CheckCircle className='w-4 h-4 text-white' />
                </div>
              )}
            </div>

            <h3 className='text-lg font-bold text-center mb-2 line-clamp-2'>
              {quiz.title}
            </h3>
            <p className='text-sm text-muted-foreground text-center mb-4 line-clamp-3 flex-grow min-h-[60px]'>
              {quiz.description}
            </p>

            <div className='space-y-3 mb-5 text-xs border-t border-border/20 pt-4'>
              <div className='flex items-center justify-between text-muted-foreground'>
                <span className='flex items-center gap-1.5'>
                  <BookOpen className='w-3.5 h-3.5' /> {quiz.questions.length}{' '}
                  Questões
                </span>
                {quiz.timeLimit && (
                  <span className='flex items-center gap-1.5'>
                    <Clock className='w-3.5 h-3.5' />{' '}
                    {Math.floor(quiz.timeLimit / 60)} min
                  </span>
                )}
              </div>
              <div className='flex items-center justify-between'>
                <Badge
                  className={cn(
                    'text-xs px-2 py-0.5',
                    getDifficultyColorClass(quiz.difficulty),
                  )}
                >
                  {getDifficultyText(quiz.difficulty)}
                </Badge>
                <Badge variant='secondary' className='text-xs px-2 py-0.5'>
                  +{quiz.xpReward} XP
                </Badge>
              </div>
              {quiz.galleonReward > 0 && (
                <Badge
                  variant='outline'
                  className='w-full justify-center text-xs py-1 border-yellow-500/30 text-yellow-500'
                >
                  <Coins className='w-3 h-3 mr-1' /> +{quiz.galleonReward}{' '}
                  Galeões
                </Badge>
              )}
            </div>

            {quiz.isCompleted && quiz.bestScore !== undefined && (
              <div className='mb-4 p-2 text-center bg-green-500/10 rounded-lg border border-green-500/20'>
                <p className='text-xs text-green-700 font-semibold'>
                  Completado! Melhor nota: {quiz.bestScore}%
                </p>
              </div>
            )}

            <Button
              className='w-full mt-auto transition-transform group-hover:scale-105'
              onClick={() =>
                quiz.isCompleted ? onShowSummary(quiz) : onStartQuiz(quiz)
              }
              variant={quiz.isCompleted ? 'secondary' : 'default'}
              size='sm'
            >
              {quiz.isCompleted ? (
                <>
                  {' '}
                  <Star className='w-4 h-4 mr-2' /> Ver Resumo{' '}
                </>
              ) : (
                'Começar Poção'
              )}
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
