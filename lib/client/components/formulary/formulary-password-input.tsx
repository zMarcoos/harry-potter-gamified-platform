import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/core/utils/utils';
import { Label } from '@/lib/client/components/ui/label';
import { Input } from '@/lib/client/components/ui/input';
import { Button } from '@/lib/client/components/ui/button';

type FormularyPasswordInputProperties = {
  label: string;
  icon: LucideIcon;
  error?: string;
  showPassword: boolean;
  onTogglePassword: () => void;
} & Omit<React.ComponentProps<'input'>, 'type'>;

export default function FormularyPasswordInput({
  label,
  icon: Icon,
  error,
  showPassword,
  onTogglePassword,
  id,
  name,
  ...properties
}: FormularyPasswordInputProperties) {
  return (
    <div className='space-y-1.5'>
      <Label
        className={cn('flex items-center gap-2', error && 'text-destructive')}
        htmlFor={id}
      >
        <Icon className='h-4 w-4' /> {label}
      </Label>
      <div className='relative'>
        <Input
          id={id}
          name={name}
          type={showPassword ? 'text' : 'password'}
          aria-invalid={!!error}
          className={cn(
            'pr-10',
            error && 'border-destructive focus-visible:ring-destructive',
          )}
          {...properties}
        />
        <Button
          className='absolute right-0 top-0 h-full px-3'
          onClick={onTogglePassword}
          size='icon'
          type='button'
          variant='ghost'
        >
          {showPassword ? (
            <EyeOff className='h-4 w-4' />
          ) : (
            <Eye className='h-4 w-4' />
          )}
        </Button>
      </div>
      {error && <p className='text-sm text-destructive'>{error}</p>}
    </div>
  );
}
