'use client';

import { DoorOpen } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { ClassSelector } from '@/lib/client/components/class/class-selector';
import { LoadingScreen } from '@/lib/client/components/loading-screen';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/lib/client/components/ui/card';
import { MagicalParticles } from '@/lib/client/components/ui/magical-particles';
import { useAuthState } from '@/lib/client/contexts/auth-context';
import { useClassStore } from '@/lib/client/store/class-store';

export default function SelectClassPage() {
  const { user, isLoading: authLoading } = useAuthState();
  const router = useRouter();
  const { selectedClassId, selectClass } = useClassStore();
  const [isNavigating, setIsNavigating] = useState(false);

  useEffect(() => {
    if (!authLoading && user && selectedClassId) {
      setIsNavigating(true);
      router.replace('/great-hall');
    }
  }, [selectedClassId, router, authLoading, user]);

  const handleEnrollmentSuccess = async (classId: string): Promise<boolean> => {
    if (!user) {
      toast.error('Usuário não autenticado.');
      return false;
    }

    setIsNavigating(true);

    const wasSuccessful = await selectClass(classId, user.id);
    if (!wasSuccessful) setIsNavigating(false);

    return wasSuccessful;
  };

  if (authLoading) {
    return <LoadingScreen message='Verificando sua identidade mágica...' />;
  }

  if (!user) {
    router.replace('/login');
    return (
      <LoadingScreen message='Usuário não encontrado. Redirecionando...' />
    );
  }

  if (selectedClassId || isNavigating) {
    return <LoadingScreen message='Redirecionando para o Grande Salão...' />;
  }

  return (
    <div className='flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-accent/5 to-background p-4'>
      <MagicalParticles count={25} />
      <div className='relative z-10 w-full max-w-6xl'>
        <Card className='magical-border border-accent/20 shadow-2xl backdrop-blur-sm bg-card/80'>
          <CardHeader className='pb-6 text-center space-y-4'>
            <div className='button-hover animate-glow mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent shadow-lg'>
              <DoorOpen className='h-8 w-8 text-white' />
            </div>
            <div>
              <CardTitle className='text-3xl font-bold text-chroma'>
                Portal das Turmas
              </CardTitle>
              <CardDescription className='text-lg'>
                Selecione uma turma para começar sua jornada ou crie uma nova
                aventura.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <ClassSelector
              onEnrollmentSuccess={handleEnrollmentSuccess}
              userId={user.id}
              userRole={user.role}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
