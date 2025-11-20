'use client';

import { Coins, Star, XCircle } from 'lucide-react';
import { Button } from '@/lib/client/components/ui/button';
import { Card, CardContent } from '@/lib/client/components/ui/card';
import type { EnrichedQuiz } from '@/lib/client/hooks/potions/use-potions';
import type { FinalQuizResults } from '@/lib/client/hooks/potions/use-quiz-runner';

interface QuizSummaryProperties {
  quiz: EnrichedQuiz;
  results: FinalQuizResults;
  onGoBack: () => void;
}

export function QuizSummary({
  quiz,
  results,
  onGoBack,
}: QuizSummaryProperties) {
  const percentage = results.score;
  const isPerfect = percentage === 100;
  const earnedRewards = results.galleonsGained > 0 || results.xpGained > 0;

  const xpBase =
    results.xpGained - results.comboBonus - results.performanceBonus;

  return (
    <div className='animate-fade-in flex items-center justify-center py-10'>
      <Card className='w-full max-w-2xl magical-border card-hover border-accent/20 bg-card/70 backdrop-blur-sm'>
        <CardContent className='p-8 text-center'>
          <div className='mb-6'>
            <div className='w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center animate-glow shadow-lg'>
              <span className='text-5xl'>🏆</span>
            </div>
            <h1 className='text-3xl font-bold text-magical mb-2'>
              Poção Concluída!
            </h1>
            <p className='text-lg text-muted-foreground'>
              Resultado de "{quiz.title}"
            </p>
          </div>

          <div className='grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8'>
            <div className='bg-muted/30 rounded-lg p-4'>
              <div className='text-3xl font-bold text-primary'>
                {results.correctAnswers}/{results.totalQuestions}
              </div>
              <div className='text-sm text-muted-foreground'>Acertos</div>
            </div>
            <div className='bg-muted/30 rounded-lg p-4'>
              <div className='text-3xl font-bold text-accent'>
                {percentage}%
              </div>
              <div className='text-sm text-muted-foreground'>Nota Final</div>
            </div>
            <div className='bg-muted/30 rounded-lg p-4'>
              <div className='text-3xl font-bold text-secondary'>
                +{results.xpGained}
              </div>
              <div className='text-sm text-muted-foreground'>XP Ganho</div>
              {(results.comboBonus > 0 || results.performanceBonus > 0) && (
                <div className='text-xs text-secondary/80 mt-1'>
                  (Base: {xpBase} + Bônus:{' '}
                  {results.comboBonus + results.performanceBonus})
                </div>
              )}
            </div>
          </div>

          <div
            className={`mb-6 p-3 rounded-lg border ${
              earnedRewards
                ? 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-yellow-500/30'
                : 'bg-destructive/10 border-destructive/20'
            }`}
          >
            <div
              className={`flex items-center justify-center gap-2 ${
                earnedRewards ? 'text-yellow-600' : 'text-destructive'
              }`}
            >
              {earnedRewards ? (
                <Coins className='w-5 h-5' />
              ) : (
                <XCircle className='w-5 h-5' />
              )}
              <span className='font-semibold'>
                {earnedRewards
                  ? `+${results.galleonsGained} Galeões Coletados!`
                  : 'Nenhum Galeão ganho nesta tentativa.'}
              </span>
            </div>
            {!earnedRewards && (
              <p className='text-xs text-muted-foreground mt-1'>
                {!results.isFirstAttempt
                  ? 'Recompensas só na primeira tentativa.'
                  : 'Nota mínima de 70% necessária.'}
              </p>
            )}
          </div>

          {isPerfect && (
            <div className='mb-6 p-4 bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-lg border border-green-500/30'>
              <div className='flex items-center justify-center gap-2 text-green-600 mb-1'>
                <Star className='w-5 h-5 fill-current' />
                <span className='font-bold'>Resultado Perfeito!</span>
                <Star className='w-5 h-5 fill-current' />
              </div>
              <p className='text-sm text-muted-foreground'>
                Você dominou esta poção! Bônus máximos aplicados.
              </p>
            </div>
          )}

          <div className='space-y-3'>
            <Button className='w-full' onClick={onGoBack} size='lg'>
              Voltar para as Poções
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
