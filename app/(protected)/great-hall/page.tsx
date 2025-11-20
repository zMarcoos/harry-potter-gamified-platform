'use client';

import { useAuthState } from '@/lib/client/contexts/auth-context';
import { useClassStore } from '@/lib/client/store/class-store';
import { useGreatHall } from '@/lib/client/hooks/great-hall/use-great-hall';
import { LoadingScreen } from '@/lib/client/components/loading-screen';
import { ErrorDisplay } from '@/lib/client/components/ui/error-display';
import { GreatHallView } from '@/lib/client/components/great-hall/great-hall-view';
import { AuthenticatedLayout } from '@/lib/client/components/layout/AuthenticatedLayout';

function GreatHallPageContent() {
  const { user } = useAuthState();
  const { classInfo } = useClassStore();

  if (!user || !classInfo) {
    console.error('GreatHallPageContent renderizado sem user ou classInfo!');
    return <LoadingScreen message='Aguardando dados...' />;
  }

  const { data, status, error, onlineUsers, refetch } = useGreatHall(
    classInfo.id,
  );

  switch (status) {
    case 'pending':
      return <LoadingScreen message='Conjurando os dados do Grande Salão...' />;
    case 'error':
      return (
        <ErrorDisplay
          message={error || 'Erro desconhecido'}
          onRetry={refetch}
        />
      );
    case 'success':
      return (
        <GreatHallView
          classInfo={classInfo}
          user={user}
          data={data!}
          onlineUsers={onlineUsers}
          onRefetch={refetch}
        />
      );
    default:
      return null;
  }
}

export default function GreatHallPageWithLayout() {
  return (
    <AuthenticatedLayout>
      <GreatHallPageContent />
    </AuthenticatedLayout>
  );
}
