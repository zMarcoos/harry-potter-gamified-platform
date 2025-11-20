'use client';

import {
  ArrowLeft,
  Check,
  Code,
  Copy,
  Eye,
  Heart,
  MessageCircle,
  Star,
  Trash2,
} from 'lucide-react';
import { useState, useMemo } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { toast } from 'sonner';

import { useAuthState } from '@/lib/client/contexts/auth-context';
import { useForumPostDetail } from '@/lib/client/hooks/great-hall/use-forum-post-detail';
import type {
  EnrichedForumPost,
  EnrichedForumPostReply,
} from '@/lib/core/types/forum.type';
import { cn } from '@/lib/core/utils/utils';

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/lib/client/components/ui/avatar';
import { Badge } from '@/lib/client/components/ui/badge';
import { Button } from '@/lib/client/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/lib/client/components/ui/card';
import { Textarea } from '@/lib/client/components/ui/textarea';
import { LoadingScreen } from '@/lib/client/components/loading-screen';

interface ForumPostDetailProps {
  post: EnrichedForumPost;
  onBack: () => void;
  classId: string;
}

export function ForumPostDetail({
  post,
  classId,
  onBack,
}: ForumPostDetailProps) {
  const { user } = useAuthState();
  const {
    replies,
    isLoading,
    addReply,
    isAddingReply,
    toggleReplyLike,
    deleteReply,
    isDeletingReply,
  } = useForumPostDetail(classId, post.id, user);

  const [newReply, setNewReply] = useState('');
  const [newCode, setNewCode] = useState('');
  const [showCode, setShowCode] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const bestReplyId = useMemo(() => {
    if (!replies || replies.length === 0) return null;
    const sortedByLikes = [...replies].sort(
      (a, b) => b.likes.length - a.likes.length,
    );
    const topReply = sortedByLikes[0];
    if (
      topReply.likes.length > 0 &&
      (sortedByLikes.length === 1 ||
        topReply.likes.length > (sortedByLikes[1]?.likes.length || 0))
    ) {
      return topReply.id;
    }
    return null;
  }, [replies]);

  const handleAddReply = async () => {
    if (!newReply.trim() || !user || isAddingReply) return;

    try {
      await addReply({
        content: newReply.trim(),
        code: showCode ? newCode.trim() : undefined,
      });
      setNewReply('');
      setNewCode('');
      setShowCode(false);
    } catch (error) {
      console.log(error);
    }
  };

  const copyCode = (code: string, id: string) => {
    try {
      const textArea = document.createElement('textarea');
      textArea.value = code;
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);

      setCopiedId(id);
      toast.success('Código copiado!');
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      toast.error('Falha ao copiar o código.');
      console.error('Falha ao copiar:', err);
    }
  };

  return (
    <div className='space-y-6 animate-fade-in'>
      <Button onClick={onBack} variant='ghost'>
        <ArrowLeft className='w-4 h-4 mr-2' />
        Voltar ao Fórum
      </Button>

      <Card className='magical-border card-hover border-accent/20 bg-card/60'>
        <CardHeader>
          <CardTitle className='text-2xl mb-3'>{post.title}</CardTitle>
          <div className='flex items-center justify-between flex-wrap gap-4'>
            <div className='flex items-center gap-3'>
              <Avatar className='w-10 h-10'>
                <AvatarImage src={post.author.avatar} />
                <AvatarFallback>{post.author.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <p className='font-medium'>{post.author.name}</p>
                <p className='text-xs text-muted-foreground'>
                  {new Date(post.createdAt).toLocaleString('pt-BR')}
                </p>
              </div>
            </div>
            <div className='flex items-center gap-4 text-sm text-muted-foreground'>
              <span className='flex items-center gap-1.5'>
                <Eye className='w-4 h-4' /> {post.views}
              </span>
              <span className='flex items-center gap-1.5'>
                <MessageCircle className='w-4 h-4' /> {replies.length}
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className='whitespace-pre-wrap'>{post.content}</p>
          {post.code && (
            <div className='mt-4 relative group'>
              <Button
                onClick={() => copyCode(post.code!, post.id)}
                size='sm'
                variant='ghost'
                className='absolute top-2 right-2 z-10 h-7 text-xs opacity-0 group-hover:opacity-100 transition-opacity'
              >
                {copiedId === post.id ? (
                  <Check className='w-3 h-3 mr-1' />
                ) : (
                  <Copy className='w-3 h-3 mr-1' />
                )}
                {copiedId === post.id ? 'Copiado!' : 'Copiar'}
              </Button>
              <SyntaxHighlighter
                language='javascript'
                style={vscDarkPlus}
                customStyle={{
                  borderRadius: '0.5rem',
                  margin: 0,
                  padding: '1rem',
                }}
              >
                {post.code}
              </SyntaxHighlighter>
            </div>
          )}
        </CardContent>
      </Card>

      <div className='space-y-4'>
        <h3 className='text-lg font-semibold'>Respostas ({replies.length})</h3>
        {isLoading ? (
          <LoadingScreen message='Carregando respostas...' />
        ) : replies.length === 0 ? (
          <Card className='bg-card/50'>
            <CardContent className='p-8 text-center text-muted-foreground'>
              Nenhuma resposta ainda.
            </CardContent>
          </Card>
        ) : (
          replies.map((reply: EnrichedForumPostReply) => {
            const isReplyAuthor = user?.id === reply.authorId;
            const isLiked = user ? reply.likes.includes(user.id) : false;
            const isBest = reply.id === bestReplyId;

            return (
              <Card
                key={reply.id}
                className={cn(
                  'transition-all border',
                  isBest
                    ? 'ring-2 ring-green-500 bg-green-950/20 border-green-700/50'
                    : 'magical-border bg-card/50',
                )}
              >
                <CardContent className='p-4'>
                  <div className='flex justify-between items-start'>
                    <div className='flex items-center gap-3'>
                      <Avatar className='w-8 h-8'>
                        <AvatarImage src={reply.author.avatar} />
                        <AvatarFallback>
                          {reply.author.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className='font-medium text-sm'>
                          {reply.author.name}
                        </p>
                        <p className='text-xs text-muted-foreground'>
                          {new Date(reply.createdAt).toLocaleString('pt-BR')}
                        </p>
                      </div>
                    </div>
                    {isBest && (
                      <Badge className='bg-green-600/20 text-green-300 border-green-500/30'>
                        <Star className='w-3 h-3 mr-1 fill-current' />
                        Melhor Resposta
                      </Badge>
                    )}
                  </div>
                  <p className='whitespace-pre-wrap my-4 text-sm text-foreground/90'>
                    {reply.content}
                  </p>
                  {reply.code && (
                    <div className='mt-3 relative group'>
                      <Button
                        className='absolute top-2 right-2 z-10 h-6 text-xs opacity-0 group-hover:opacity-100 transition-opacity'
                        onClick={() => copyCode(reply.code!, reply.id)}
                        size='sm'
                        variant='ghost'
                        disabled={isDeletingReply}
                      >
                        {copiedId === reply.id ? (
                          <Check className='w-3 h-3 mr-1' />
                        ) : (
                          <Copy className='w-3 h-3 mr-1' />
                        )}
                        {copiedId === reply.id ? 'Copiado!' : 'Copiar'}
                      </Button>
                      <SyntaxHighlighter
                        language='javascript'
                        style={vscDarkPlus}
                        customStyle={{
                          borderRadius: '0.375rem',
                          margin: 0,
                          padding: '0.75rem',
                        }}
                      >
                        {reply.code}
                      </SyntaxHighlighter>
                    </div>
                  )}
                  <div className='flex items-center gap-2 mt-3 pt-2 border-t border-border/20'>
                    <Button
                      variant='ghost'
                      size='sm'
                      className={cn(
                        'text-muted-foreground hover:text-red-500',
                        isLiked && 'text-red-500',
                      )}
                      onClick={() => user && toggleReplyLike(reply.id)}
                      disabled={!user || isDeletingReply}
                    >
                      <Heart
                        className={`w-4 h-4 mr-1 ${isLiked ? 'fill-current' : ''}`}
                      />
                      {reply.likes.length}
                    </Button>
                    {isReplyAuthor && (
                      <Button
                        variant='ghost'
                        size='icon'
                        className='h-7 w-7 text-muted-foreground hover:text-destructive ml-auto'
                        onClick={() => deleteReply(reply.id)}
                        disabled={isDeletingReply}
                      >
                        <Trash2 className='w-4 h-4' />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      <Card className='magical-border'>
        <CardHeader>
          <CardTitle className='text-lg'>Sua Resposta</CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <Textarea
            placeholder='Escreva sua resposta...'
            value={newReply}
            onChange={(e) => setNewReply(e.target.value)}
            disabled={!user || isAddingReply}
          />
          <div className='flex items-center gap-2'>
            <Button
              onClick={() => setShowCode(!showCode)}
              size='sm'
              variant='outline'
              disabled={!user || isAddingReply}
            >
              <Code className='w-4 h-4 mr-2' />
              {showCode ? 'Esconder Código' : 'Adicionar Código'}
            </Button>
          </div>
          {showCode && (
            <Textarea
              className='font-mono'
              placeholder='Cole seu código aqui...'
              value={newCode}
              onChange={(e) => setNewCode(e.target.value)}
              disabled={!user || isAddingReply}
            />
          )}
          <Button
            className='w-full'
            disabled={!newReply.trim() || !user || isAddingReply}
            onClick={handleAddReply}
          >
            {isAddingReply ? 'Enviando...' : 'Enviar Resposta'}{' '}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
