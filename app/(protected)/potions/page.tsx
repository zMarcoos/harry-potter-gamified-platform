'use client';

import { Coins, Sparkles, Star, Trophy, FlaskConical } from 'lucide-react';

import {
  useAuthState,
  useAuthActions,
} from '@/lib/client/contexts/auth-context';
import { usePotions } from '@/lib/client/hooks/potions/use-potions';
import { useClassStore } from '@/lib/client/store/class-store';

import { LoadingScreen } from '@/lib/client/components/loading-screen';
import { QuizList } from '@/lib/client/components/potions/QuizList';
import { QuizRunner } from '@/lib/client/components/potions/QuizRunner';
import { QuizSummary } from '@/lib/client/components/potions/QuizSummary';
import { CompletedQuizSummary } from '@/lib/client/components/potions/CompletedQuizSummary';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/lib/client/components/ui/card';
import { AuthenticatedLayout } from '@/lib/client/components/layout/AuthenticatedLayout';
import { Header } from '@/lib/client/components/great-hall/header';

function PotionsPageContent() {
  const { user } = useAuthState();
  const { logout } = useAuthActions();
  const { classInfo } = useClassStore();

  if (!user || !classInfo) {
    console.error('PotionsPageContent renderizado sem user ou classInfo!');
    return <LoadingScreen message='Aguardando dados...' />;
  }

  const {
    quizzes,
    isLoading: isPotionsLoading,
    status,
    selectedQuiz,
    lastResults,
    startQuiz,
    showCompletedSummary,
    handleQuizFinish,
    goToList,
  } = usePotions(classInfo.id, user);

  return (
    <div className='min-h-screen bg-gradient-to-br from-background via-card to-background'>
      <Header
        title='Aulas de Poções'
        subtitle='Teste seus conhecimentos mágicos'
        icon={FlaskConical}
        showBackButton={true}
        backButtonHref='/great-hall'
        showCurrency='galleons'
        user={user}
        classInfo={classInfo}
        onLogout={logout}
      />

      <div className='container mx-auto px-4 py-8'>
        {isPotionsLoading && status === 'list' && (
          <LoadingScreen message='Carregando quizzes...' />
        )}

        {status === 'list' && !isPotionsLoading && (
          <div className='space-y-8'>
            <QuizList
              quizzes={quizzes}
              onStartQuiz={startQuiz}
              onShowSummary={showCompletedSummary}
            />
            <Card className='magical-border card-hover border-accent/20 bg-card/60 backdrop-blur-sm'>
              <CardHeader>
                <CardTitle className='flex items-center gap-2 text-xl'>
                  <Sparkles className='w-6 h-6 text-accent animate-sparkle' />
                  Como Funciona
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='grid grid-cols-1 md:grid-cols-3 gap-6 text-center'>
                  <div className='space-y-2'>
                    <div className='w-12 h-12 mx-auto mb-2 rounded-full bg-green-500/20 flex items-center justify-center ring-2 ring-green-500/30'>
                      <Trophy className='w-6 h-6 text-green-500' />
                    </div>
                    <h4 className='font-semibold'>Sistema de Combos</h4>
                    <p className='text-xs text-muted-foreground'>
                      Acerte em sequência para bônus de XP! <br />
                      3+ = +20% | 5+ = +30% | 10+ = +50%
                    </p>
                  </div>
                  <div className='space-y-2'>
                    <div className='w-12 h-12 mx-auto mb-2 rounded-full bg-blue-500/20 flex items-center justify-center ring-2 ring-blue-500/30'>
                      <Star className='w-6 h-6 text-blue-500' />
                    </div>
                    <h4 className='font-semibold'>Bônus de Performance</h4>
                    <p className='text-xs text-muted-foreground'>
                      Notas altas rendem XP extra! <br />
                      100% = +50% | 90%+ = +25% | 80%+ = +10%
                    </p>
                  </div>
                  <div className='space-y-2'>
                    <div className='w-12 h-12 mx-auto mb-2 rounded-full bg-yellow-500/20 flex items-center justify-center ring-2 ring-yellow-500/30'>
                      <Coins className='w-6 h-6 text-yellow-500' />
                    </div>
                    <h4 className='font-semibold'>Recompensas</h4>
                    <p className='text-xs text-muted-foreground'>
                      Complete na 1ª vez (≥70%) para ganhar XP e Galeões.
                      <br /> Bônus por combo e performance!
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {status === 'running' && selectedQuiz && user && (
          <QuizRunner
            quiz={selectedQuiz}
            classId={classInfo.id}
            user={user}
            onFinish={handleQuizFinish}
          />
        )}
        {status === 'summary' && selectedQuiz && lastResults && (
          <QuizSummary
            quiz={selectedQuiz}
            results={lastResults}
            onGoBack={goToList}
          />
        )}
        {status === 'completedSummary' && selectedQuiz && (
          <CompletedQuizSummary quiz={selectedQuiz} onGoBack={goToList} />
        )}
      </div>
    </div>
  );
}

export default function PotionsPageWithLayout() {
  return (
    <AuthenticatedLayout>
      <PotionsPageContent />
    </AuthenticatedLayout>
  );
}
