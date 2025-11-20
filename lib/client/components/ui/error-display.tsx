'use client';

import { RefreshCcw, AlertTriangle } from 'lucide-react';
import { Button } from './button';
import { Card, CardContent } from './card';

interface ErrorDisplayProps {
  message: string;
  description?: string;
  onRetry: () => void;
}

export function ErrorDisplay({
  message = 'Algo deu errado',
  description = 'Houve um problema ao processar sua solicitação. Por favor, tente novamente.',
  onRetry,
}: ErrorDisplayProps) {
  return (
    <div className='flex items-center justify-center min-h-[400px] w-full'>
      <Card className='w-full max-w-md bg-card/50 border-destructive/30'>
        <CardContent className='p-8 text-center'>
          <div className='mb-4 flex justify-center'>
            <div className='w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center'>
              <AlertTriangle className='w-8 h-8 text-destructive' />
            </div>
          </div>
          <h2 className='text-xl font-semibold text-destructive mb-2'>
            {message}
          </h2>
          <p className='text-muted-foreground mb-6'>
            {description}
          </p>
          <Button onClick={onRetry} className='gap-2'>
            <RefreshCcw className='w-4 h-4' />
            Tentar Novamente
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
