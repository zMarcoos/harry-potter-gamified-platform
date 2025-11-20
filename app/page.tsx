'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuthState } from '@/lib/client/contexts/auth-context';
import { LoadingScreen } from '@/lib/client/components/loading-screen';
import { useClassStore } from '@/lib/client/store/class-store';

export default function HomePage() {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuthState();
  const { selectedClassId } = useClassStore();
  const router = useRouter();

  const [hasMounted, setHasMounted] = useState(false);
  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    if (!hasMounted || isAuthLoading) return;

    router.replace(
      isAuthenticated
        ? selectedClassId
          ? '/great-hall'
          : '/select-class'
        : '/login',
    );
  }, [hasMounted, isAuthLoading, isAuthenticated, selectedClassId, router]);

  return <LoadingScreen message='Determinando sua rota mágica...' />;
}
