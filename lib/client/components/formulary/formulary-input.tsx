import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/core/utils/utils';
import { Label } from '@/lib/client/components/ui/label';
import { Input } from '@/lib/client/components/ui/input';

type FormularyInputProperties = {
  label: string;
  icon: LucideIcon;
  error?: string;
} & React.ComponentProps<'input'>;

export default function FormularyInput({
  label,
  icon: Icon,
  error,
  id,
  name,
  ...properties
}: FormularyInputProperties) {
  return (
    <div className='space-y-1.5'>
      <Label
        className={cn('flex items-center gap-2', error && 'text-destructive')}
        htmlFor={id}
      >
        <Icon className='h-4 w-4' /> {label}
      </Label>
      <Input
        id={id}
        name={name}
        aria-invalid={!!error}
        className={cn(
          error && 'border-destructive focus-visible:ring-destructive',
        )}
        {...properties}
      />
      {error && <p className='text-sm text-destructive'>{error}</p>}
    </div>
  );
}
