'use client';

import { ArrowRight, BookOpen, Lock, Users } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

import { Badge } from "@/lib/client/components/ui/badge";
import { Button } from '@/lib/client/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/lib/client/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/lib/client/components/ui/dialog';
import { Input } from '@/lib/client/components/ui/input';
import { Label } from '@/lib/client/components/ui/label';
import { cn } from '@/lib/core/utils/utils';
import type { Class } from '@/lib/core/types/class.type';

function ClassCardSkeleton() {
  return (
    <div className='flex flex-col rounded-lg border border-border/10 bg-card/30 p-4 space-y-4 animate-pulse'>
      <div className='h-6 w-3/4 rounded bg-muted/30'></div>
      <div className='h-4 w-full rounded bg-muted/30'></div>
      <div className='h-4 w-1/2 rounded bg-muted/30'></div>
      <div className='flex-grow'></div>
      <div className='h-10 w-full rounded bg-muted/30'></div>
    </div>
  );
}

interface ClassCardProps {
  classData: Class; isActive: boolean; isJoining: boolean; onCardClick: () => void; onJoinAttempt: () => void;
}

function ClassCard({ classData, isActive, isJoining, onCardClick, onJoinAttempt }: ClassCardProps) {
  const memberCount = Object.keys(classData.users || {}).length;
  return (
    <Card className={cn('magical-border card-hover flex flex-col bg-card/50 border-border/20 cursor-pointer transition-all duration-300 ease-in-out', isActive && 'ring-2 ring-primary scale-105 shadow-primary/20')} onClick={onCardClick}>
      <CardHeader><CardTitle className='flex items-center gap-2 text-xl'><BookOpen className='h-5 w-5 text-primary/80' />{classData.name}</CardTitle><CardDescription className='pt-1'>{classData.description}</CardDescription></CardHeader>
      <div className={cn('flex-grow flex flex-col transition-all duration-300 ease-in-out overflow-hidden', isActive ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0')}>
        <CardContent className='flex-grow space-y-4 pb-4'>
          <div className='flex items-center justify-between text-sm text-muted-foreground'><div className='flex items-center gap-2'><Users className='h-4 w-4 text-primary' /><span>{memberCount} Aluno(s)</span></div>{classData.isPrivate && <Badge variant='outline' className='flex items-center gap-1.5 border-accent/30 text-accent'><Lock className='h-3 w-3' />Privada</Badge>}</div>
          <div className='flex flex-wrap gap-2 pt-2'><Badge variant='secondary'>Fórum</Badge><Badge variant='secondary'>Quizzes</Badge><Badge variant='secondary'>Duelos</Badge><Badge variant='secondary'>Loja</Badge></div>
        </CardContent>
        <CardFooter><Button className='w-full button-hover group' disabled={isJoining} onClick={(event) => { event.stopPropagation(); onJoinAttempt(); }}>{isJoining ? (<><div className='mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent' />Entrando...</>) : (<>Entrar na Turma<ArrowRight className='ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform' /></>)}</Button></CardFooter>
      </div>
    </Card>
  );
}

interface ClassSelectorProps {
  userRole: 'student' | 'professor' | 'admin';
  userId: string;
  onEnrollmentSuccess: (classId: string) => Promise<boolean>;
}

export function ClassSelector({ userRole, userId, onEnrollmentSuccess }: ClassSelectorProps) {
  const [availableClasses, setAvailableClasses] = useState<Class[]>([]);
  const [isLoadingClasses, setIsLoadingClasses] = useState(true);
  const [activeClassId, setActiveClassId] = useState<string | null>(null);
  const [joiningClassId, setJoiningClassId] = useState<string | null>(null);
  const [classRequiringPassword, setClassRequiringPassword] = useState<Class | null>(null);
  const [isSubmittingPassword, setIsSubmittingPassword] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const response = await fetch('/api/classes');
        if (!response.ok) throw new Error('Não foi possível buscar as turmas.');
        const data = await response.json();
        setAvailableClasses(data.classes || []);
      } catch (error) {
        console.error('Erro ao carregar turmas:', error);
        toast.error('Erro ao carregar turmas', { description: 'Por favor, tente recarregar a página.' });
      } finally {
        setIsLoadingClasses(false);
      }
    };
    fetchClasses();
  }, []);

  const handleEnrollmentAttempt = useCallback(async (classToJoin: Class) => {
    setJoiningClassId(classToJoin.id);

    if (classToJoin.isPrivate && userRole === 'student') {
      setClassRequiringPassword(classToJoin);
      return;
    }

    try {
      const response = await fetch('/api/classes/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ classId: classToJoin.id, userId: userId }),
      });
      const responseData = await response.json();
      if (!response.ok) throw new Error(responseData.error || 'Falha ao se matricular na turma.');

      await onEnrollmentSuccess(classToJoin.id);

    } catch (error: any) {
      toast.error('Erro na Matrícula', { description: error.message });
      setJoiningClassId(null);
    }
  }, [userRole, userId, onEnrollmentSuccess]);

  const handlePasswordSubmit = async () => {
    if (!classRequiringPassword) return;
    setIsSubmittingPassword(true);
    setPasswordError('');
    try {
      const response = await fetch('/api/classes/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ classId: classRequiringPassword.id, password: passwordInput, userId: userId }),
      });
      const responseData = await response.json();
      if (!response.ok) throw new Error(responseData.error || 'Senha incorreta.');

      const wasSuccessful = await onEnrollmentSuccess(classRequiringPassword.id);
      if (wasSuccessful) {
        handleCloseDialog(false);
      } else {
        throw new Error("A matrícula foi bem-sucedida, mas a seleção da turma falhou.");
      }
    } catch (error: any) {
      setPasswordError(error.message);
      setJoiningClassId(null);
    } finally {
      setIsSubmittingPassword(false);
    }
  };

  const handleCloseDialog = (clearJoiningState = true) => {
    setClassRequiringPassword(null);
    setPasswordInput('');
    setPasswordError('');
    if (clearJoiningState) {
      setJoiningClassId(null);
    }
  };

  if (isLoadingClasses) {
    return <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6'><ClassCardSkeleton /><ClassCardSkeleton /><ClassCardSkeleton /></div>;
  }

  return (
    <div className='container mx-auto p-0 md:p-6'>
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
        {availableClasses.map((classData) => (
          <ClassCard
            key={classData.id}
            classData={classData}
            isActive={activeClassId === classData.id}
            isJoining={joiningClassId === classData.id}
            onCardClick={() => setActiveClassId(prevId => prevId === classData.id ? null : classData.id)}
            onJoinAttempt={() => handleEnrollmentAttempt(classData)}
          />
        ))}
      </div>
      <Dialog open={!!classRequiringPassword} onOpenChange={(isOpen) => !isOpen && handleCloseDialog()}>
        <DialogContent className='magical-border bg-card border-accent/20'>
          <DialogHeader><DialogTitle>Acesso à Turma Privada: {classRequiringPassword?.name}</DialogTitle><DialogDescription>Esta turma é protegida por um feitiço. Digite a senha para entrar.</DialogDescription></DialogHeader>
          <div className='space-y-4 py-4'>
            <div><Label htmlFor='password'>Senha da Turma</Label><Input id='password' type='password' value={passwordInput} onChange={(event) => setPasswordInput(event.target.value)} placeholder='••••••••' className='mt-1' disabled={isSubmittingPassword} /></div>
            {passwordError && <p className='text-sm text-destructive'>{passwordError}</p>}
          </div>
          <div className='flex gap-2 justify-end'><Button variant='outline' onClick={() => handleCloseDialog()} disabled={isSubmittingPassword}>Cancelar</Button><Button onClick={handlePasswordSubmit} disabled={isSubmittingPassword}>{isSubmittingPassword && <div className='mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent' />}Confirmar Entrada</Button></div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
