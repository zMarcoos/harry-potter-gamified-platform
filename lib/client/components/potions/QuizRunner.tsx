'use client';

import { useState, useEffect } from 'react';
import { Timer, BookOpen, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/lib/client/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/lib/client/components/ui/card';
import { Progress } from '@/lib/client/components/ui/progress';
import { Badge } from '@/lib/client/components/ui/badge';
import { useQuizRunner } from '@/lib/client/hooks/potions/use-quiz-runner';
import type { EnrichedQuiz } from '@/lib/client/hooks/potions/use-potions';
import type { ClientUser } from '@/lib/core/types/user.type';
import { cn } from '@/lib/core/utils/utils';

interface QuizRunnerProps {
  quiz: EnrichedQuiz;
  classId: string;
  user: ClientUser;
  onFinish: (results: any) => void;
}

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export function QuizRunner({ quiz, classId, user, onFinish }: QuizRunnerProps) {
  const {
    currentQuestion,
    currentQuestionIndex,
    totalQuestions,
    timeLeft,
    progress,
    selectedAnswerForCurrent,
    isSubmitting,
    selectAnswer,
    nextQuestion,
  } = useQuizRunner(quiz, classId, user, onFinish);

  const [showExplanation, setShowExplanation] = useState(false);

  useEffect(() => {
    setShowExplanation(false);
  }, [currentQuestionIndex]);

  const handleAnswerSelect = (answerIndex: number) => {
    if (selectedAnswerForCurrent !== null) return;

    selectAnswer(currentQuestionIndex, answerIndex);
    setShowExplanation(true);
  };

  if (isSubmitting) {
    return (
      <div className='min-h-[400px] flex items-center justify-center'>
        <div className='text-center'>
          <div className='w-16 h-16 mx-auto mb-4 border-4 border-accent border-t-transparent rounded-full animate-spin' />
          <p className='text-muted-foreground'>
            Calculando resultado da poção...
          </p>
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className='text-center text-destructive'>
        Erro: Nenhuma questão encontrada.
      </div>
    );
  }

  const correctAnswerIndex = currentQuestion.correctAnswer;

  return (
    <div className='animate-fade-in'>
      <header className='border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50 mb-8'>
        <div className='container mx-auto px-4 py-4'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-3'>
              <div className='w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center'>
                <span className='text-xl'>🧪</span>
              </div>
              <div>
                <h1 className='text-lg font-bold'>{quiz.title}</h1>
                <p className='text-sm text-muted-foreground'>
                  Questão {currentQuestionIndex + 1} de {totalQuestions}
                </p>
              </div>
            </div>
            <div className='flex items-center gap-2 text-primary font-semibold'>
              <Timer className='w-5 h-5' />
              <span className='font-mono text-lg'>{formatTime(timeLeft)}</span>
            </div>
          </div>
          <Progress className='mt-2 h-1.5' value={progress} />
        </div>
      </header>

      <div className='container mx-auto px-4'>
        <Card className='max-w-4xl mx-auto magical-border card-hover border-accent/20 bg-card/60'>
          <CardHeader>
            <Badge variant='outline' className='w-fit mb-4'>
              Questão {currentQuestionIndex + 1}
            </Badge>
            <CardTitle className='text-xl md:text-2xl leading-relaxed !mt-0'>
              {currentQuestion.question}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-1 gap-3 mb-6'>
              {currentQuestion.options.map((option: string, index: number) => {
                const hasAnswered = selectedAnswerForCurrent !== null;
                const isCorrect = index === correctAnswerIndex;
                const isSelected = selectedAnswerForCurrent === index;

                return (
                  <Button
                    key={index}
                    onClick={() => handleAnswerSelect(index)}
                    disabled={hasAnswered || isSubmitting}
                    variant={isSelected ? 'default' : 'outline'}
                    className={cn(
                      'h-auto p-4 text-left justify-start text-wrap transition-all duration-300',
                      hasAnswered &&
                        isCorrect &&
                        'bg-green-600 hover:bg-green-700 border-green-700 text-white',
                      hasAnswered &&
                        isSelected &&
                        !isCorrect &&
                        'bg-destructive hover:bg-destructive/90 border-destructive text-white',
                      hasAnswered &&
                        !isSelected &&
                        !isCorrect &&
                        'opacity-60 cursor-not-allowed',
                    )}
                  >
                    <div className='flex items-center gap-3 w-full'>
                      <div
                        className={cn(
                          'w-8 h-8 rounded-full flex items-center justify-center font-bold flex-shrink-0 transition-colors',
                          isSelected ? 'bg-background/20' : 'bg-muted',
                        )}
                      >
                        {String.fromCharCode(65 + index)}
                      </div>
                      <span className='flex-1 text-left'>{option}</span>
                      {hasAnswered && isCorrect && (
                        <CheckCircle className='w-5 h-5 text-white flex-shrink-0' />
                      )}
                      {hasAnswered && isSelected && !isCorrect && (
                        <XCircle className='w-5 h-5 text-white flex-shrink-0' />
                      )}
                    </div>
                  </Button>
                );
              })}
            </div>

            {showExplanation && currentQuestion.explanation && (
              <div className='bg-muted/50 border border-border/20 rounded-lg p-4 mb-6 animate-fade-in'>
                <h4 className='font-semibold mb-2 flex items-center gap-2 text-foreground/90'>
                  <BookOpen className='w-4 h-4' /> Explicação
                </h4>
                <p className='text-sm leading-relaxed text-muted-foreground'>
                  {currentQuestion.explanation}
                </p>
              </div>
            )}

            {selectedAnswerForCurrent !== null && (
              <Button
                className='w-full'
                onClick={nextQuestion}
                size='lg'
                disabled={isSubmitting}
              >
                {currentQuestionIndex < totalQuestions - 1
                  ? 'Próxima Questão'
                  : 'Finalizar Poção'}
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
