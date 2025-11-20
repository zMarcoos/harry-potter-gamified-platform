'use client';

import { BookOpen, CheckCircle, Trophy, XCircle } from 'lucide-react';
import { Button } from '@/lib/client/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/lib/client/components/ui/card';
import type { EnrichedQuiz } from '@/lib/client/hooks/potions/use-potions';
import { cn } from '@/lib/core/utils/utils';

interface CompletedQuizSummaryProps {
  quiz: EnrichedQuiz;
  onGoBack: () => void;
}

export function CompletedQuizSummary({
  quiz,
  onGoBack,
}: CompletedQuizSummaryProps) {
  const scoreData = quiz.scoreData;
  const bestScore = quiz.bestScore || 0;

  return (
    <div className='animate-fade-in flex items-center justify-center py-10'>
      <Card className='w-full max-w-4xl magical-border card-hover border-accent/20 bg-card/70 backdrop-blur-sm'>
        <CardHeader className='flex flex-row items-center justify-between'>
          <div>
            <CardTitle className='text-2xl font-bold text-chroma mb-1'>
              {quiz.title}
            </CardTitle>
            <p className='text-muted-foreground'>Resumo do Quiz Completado</p>
          </div>
          <Button onClick={onGoBack} variant='ghost'>
            <XCircle className='w-4 h-4 mr-2' /> Voltar
          </Button>
        </CardHeader>
        <CardContent className='p-6 space-y-6'>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            <div className='bg-muted/30 rounded-lg p-4 text-center'>
              <div className='text-3xl font-bold text-primary'>
                {bestScore}%
              </div>
              <div className='text-sm text-muted-foreground'>Melhor Nota</div>
            </div>
            <div className='bg-muted/30 rounded-lg p-4 text-center'>
              <div className='text-lg font-semibold text-accent'>
                {scoreData?.completedAt
                  ? new Date(scoreData.completedAt).toLocaleDateString('pt-BR')
                  : 'N/A'}
              </div>
              <div className='text-sm text-muted-foreground'>
                Última Tentativa
              </div>
            </div>
            <div className='bg-muted/30 rounded-lg p-4 text-center'>
              <div className='text-lg font-semibold text-secondary'>
                {scoreData?.attempts || 1}
              </div>
              <div className='text-sm text-muted-foreground'>Tentativa(s)</div>
            </div>
          </div>

          <div className='p-4 bg-blue-500/10 rounded-lg border border-blue-500/20'>
            <div className='flex items-center gap-2 mb-2'>
              <Trophy className='w-5 h-5 text-blue-500' />
              <span className='font-semibold text-blue-700'>
                Este quiz foi completado!
              </span>
            </div>
            <p className='text-sm text-muted-foreground'>
              Você já concluiu este quiz. Veja as explicações das questões
              abaixo para revisar. Não é possível refazer quizzes valendo nota.
            </p>
          </div>

          <div className='space-y-4'>
            <h3 className='text-xl font-semibold'>Gabarito e Explicações</h3>
            {quiz.questions.map((question, index) => (
              <Card key={index} className='bg-background/40 border-border/20'>
                <CardHeader>
                  <CardTitle className='text-base font-semibold'>
                    Questão {index + 1}: {question.question}
                  </CardTitle>
                </CardHeader>
                <CardContent className='space-y-2'>
                  {question.options.map((option, optionIndex) => {
                    const isCorrect = optionIndex === question.correctAnswer;
                    return (
                      <div
                        key={optionIndex}
                        className={cn(
                          'p-2 rounded flex items-center gap-2 text-sm',
                          isCorrect
                            ? 'bg-green-500/20 border border-green-500/40 text-green-700 font-medium'
                            : 'bg-muted/30 text-muted-foreground',
                        )}
                      >
                        {isCorrect ? (
                          <CheckCircle className='w-4 h-4 text-green-500 flex-shrink-0' />
                        ) : (
                          <div className='w-4 h-4 flex-shrink-0' />
                        )}
                        <span>{option}</span>
                      </div>
                    );
                  })}
                  {question.explanation && (
                    <div className='mt-3 pt-3 border-t border-border/20'>
                      <div className='flex items-start gap-2'>
                        <BookOpen className='w-4 h-4 text-primary mt-0.5 flex-shrink-0' />
                        <div>
                          <span className='font-medium text-primary text-sm'>
                            Explicação:
                          </span>
                          <p className='text-sm text-muted-foreground mt-1'>
                            {question.explanation}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
