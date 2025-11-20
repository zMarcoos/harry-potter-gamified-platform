'use client';

interface LoadingScreenProps {
  message?: string;
}

export const LoadingScreen = ({ message }: LoadingScreenProps) => {
  return (
    <div className='min-h-screen bg-gradient-to-br from-background via-card to-background flex items-center justify-center'>
      <div className='text-center'>
        <div className='w-16 h-16 mx-auto mb-4 border-4 border-accent border-t-transparent rounded-full animate-spin' />
        <p className='text-muted-foreground'>
          {message || 'Carregando Hogwarts...'}
        </p>
      </div>
    </div>
  );
};
