'use client';

import { BookOpen } from 'lucide-react';
import { Badge } from '@/lib/client/components/ui/badge';
import { Button } from '@/lib/client/components/ui/button';
import type { EnrichedClass } from '@/lib/core/types/class.type';

interface ClassInfoHeaderProps {
  classInfo: EnrichedClass;
  onChangeClass: () => void;
}

export function ClassInfoHeader({
  classInfo,
  onChangeClass,
}: ClassInfoHeaderProps) {
  const memberCount = Object.keys(classInfo.users || {}).length;

  return (
    <div className='bg-card/50 border-b border-border/50'>
      <div className='container mx-auto px-4 py-3'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-4'>
            <div className='flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center'>
              <BookOpen className='w-4 h-4 text-primary' />
            </div>
            <div>
              <div className='flex items-center gap-2'>
                <span className='text-sm font-semibold text-foreground'>
                  {classInfo.name}
                </span>
                {classInfo.isPrivate && (
                  <Badge
                    variant='outline'
                    className='text-xs border-accent/30 text-accent'
                  >
                    Privada
                  </Badge>
                )}
              </div>
              <div className='flex items-center gap-2 text-xs text-muted-foreground'>
                <span>Prof. {classInfo.professor.name}</span>
                <span>•</span>
                <span>{memberCount} estudante(s)</span>
              </div>
            </div>
          </div>
          <Button
            size='sm'
            variant='ghost'
            className='text-xs hover:bg-primary/10'
            onClick={onChangeClass}
          >
            Trocar Turma
          </Button>
        </div>
      </div>
    </div>
  );
}
