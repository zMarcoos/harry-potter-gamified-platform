'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuthState } from '@/lib/client/contexts/auth-context';
import { useClassStore } from '@/lib/client/store/class-store';
import { LoadingScreen } from '@/lib/client/components/loading-screen';

interface AuthenticatedLayoutProperties {
  children: React.ReactNode;
}

export function AuthenticatedLayout({
  children,
}: AuthenticatedLayoutProperties) {
  const { user, isLoading: isAuthLoading } = useAuthState();
  const { classInfo, selectedClassId, selectClass } = useClassStore();
  const router = useRouter();
  const [isClassLoading, setIsClassLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    if (!isAuthLoading) {
      setAuthChecked(true);

      if (!user) {
        router.replace('/login');
        return;
      }

      if (!selectedClassId) {
        router.replace('/select-class');
        return;
      }

      if (classInfo) {
        setIsClassLoading(false);
      } else {
        setIsClassLoading(true);
        if (user?.id) {
          selectClass(selectedClassId, user.id).finally(() => {
            setIsClassLoading(false);
          });
        } else {
          console.error(
            'AuthenticatedLayout: User está definido, mas user.id não está. Redirecionando.',
          );
          router.replace('/login');
          setIsClassLoading(false);
        }
      }
    }
  }, [isAuthLoading, user, classInfo, selectedClassId, selectClass, router]);

  if (isAuthLoading || !authChecked || (authChecked && !user)) {
    return <LoadingScreen message='Verificando sua identidade mágica...' />;
  }

  if (!selectedClassId) {
    return <LoadingScreen message='Redirecionando para seleção de turma...' />;
  }

  if (isClassLoading) {
    return <LoadingScreen message='Carregando dados da turma...' />;
  }

  if (!classInfo) {
    router.replace('/select-class');
    return (
      <LoadingScreen message='Erro ao carregar dados da turma. Tente novamente...' />
    );
  }

  return <>{children}</>;
}
