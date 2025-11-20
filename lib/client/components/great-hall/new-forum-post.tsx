'use client';

import { useMutation } from '@tanstack/react-query';
import { Code } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/lib/client/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/lib/client/components/ui/dialog';
import { Input } from '@/lib/client/components/ui/input';
import { Label } from '@/lib/client/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/lib/client/components/ui/select';
import { Textarea } from '@/lib/client/components/ui/textarea';
import { useAuthState } from '@/lib/client/contexts/auth-context';
import { jsonFetch } from '@/lib/core/utils/api';
import type { ForumPost } from '@/lib/core/types/forum.type';

interface NewForumPostProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  classId: string;
}

type NewPostPayload = {
  classId: string;
  title: string;
  content: string;
  category: string;
  difficulty: ForumPost['difficulty'];
  code?: string;
  authorId: string;
};

export function NewForumPost({
  open,
  onOpenChange,
  onSuccess,
  classId,
}: NewForumPostProps) {
  const { user } = useAuthState();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [difficulty, setDifficulty] =
    useState<ForumPost['difficulty']>('beginner');
  const [code, setCode] = useState('');
  const [showCode, setShowCode] = useState(false);

  const categories = [
    'Frontend',
    'Backend',
    'Database',
    'DevOps',
    'Mobile',
    'UI/UX',
    'Performance',
    'Security',
    'Testing',
    'Career',
    'Other',
  ];

  const mutation = useMutation({
    mutationFn: (newPostData: NewPostPayload) =>
      jsonFetch('/api/forum', {
        method: 'POST',
        body: JSON.stringify(newPostData),
      }),
    onSuccess: () => {
      setTitle('');
      setContent('');
      setCategory('');
      setDifficulty('beginner');
      setCode('');
      setShowCode(false);

      onOpenChange(false);
      onSuccess();
    },
    onError: (error: any) => {
      console.error('Erro ao criar pergunta:', error);
      toast.error('Erro ao criar pergunta', { description: error?.message });
    },
  });

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim() || !category) {
      toast.error('Por favor, preencha todos os campos obrigatórios');
      return;
    }
    if (!user) {
      toast.error('Você precisa estar autenticado.');
      return;
    }

    mutation.mutate({
      classId,
      title,
      content,
      category,
      difficulty,
      code: showCode && code.trim() ? code : undefined,
      authorId: user.id,
    });
  };

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className='max-w-2xl'>
        <DialogHeader>
          <DialogTitle>Nova Pergunta no Fórum</DialogTitle>
        </DialogHeader>

        <div className='space-y-4 py-4'>
          <div>
            <Label htmlFor='title'>Título da Pergunta *</Label>
            <Input
              className='mt-1'
              id='title'
              onChange={(e) => setTitle(e.target.value)}
              placeholder='Ex: Como implementar autenticação JWT em Node.js?'
              value={title}
            />
          </div>

          <div>
            <Label htmlFor='content'>Descrição Detalhada *</Label>
            <Textarea
              className='mt-1 min-h-[120px]'
              id='content'
              onChange={(e) => setContent(e.target.value)}
              placeholder='Descreva seu problema ou dúvida em detalhes.'
              value={content}
            />
          </div>

          <div className='grid grid-cols-2 gap-4'>
            <div>
              <Label htmlFor='category'>Categoria *</Label>
              <Select onValueChange={setCategory} value={category}>
                <SelectTrigger className='mt-1'>
                  <SelectValue placeholder='Selecione uma categoria' />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor='difficulty'>Dificuldade *</Label>
              <Select
                onValueChange={(v) =>
                  setDifficulty(v as ForumPost['difficulty'])
                }
                value={difficulty}
              >
                <SelectTrigger className='mt-1'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='beginner'>Iniciante</SelectItem>
                  <SelectItem value='intermediate'>Intermediário</SelectItem>
                  <SelectItem value='advanced'>Avançado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Button
              onClick={() => setShowCode(!showCode)}
              size='sm'
              type='button'
              variant='outline'
            >
              <Code className='w-4 h-4 mr-2' />
              {showCode ? 'Remover Código' : 'Adicionar Código'}
            </Button>
          </div>

          {showCode && (
            <div>
              <Label htmlFor='code'>Código (opcional)</Label>
              <Textarea
                className='mt-1 font-mono text-sm min-h-[100px]'
                id='code'
                onChange={(e) => setCode(e.target.value)}
                placeholder='Cole seu código aqui...'
                value={code}
              />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)} variant='outline'>
            Cancelar
          </Button>
          <Button disabled={mutation.isPending} onClick={handleSubmit}>
            {mutation.isPending ? 'Criando...' : 'Criar Pergunta'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
