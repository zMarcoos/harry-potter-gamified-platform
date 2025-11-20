'use client';

import { useState } from 'react';
import { Loader2, Send, Trash2, Ghost } from 'lucide-react';
import type {
  SocialComment,
  EnrichedSocialPost,
} from '@/lib/core/types/social.type';
import type { ClientUser } from '@/lib/core/types/user.type';
import { cn } from '@/lib/core/utils/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/lib/client/components/ui/dialog';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/lib/client/components/ui/avatar';
import { Button } from '@/lib/client/components/ui/button';
import { Input } from '@/lib/client/components/ui/input';
import { toast } from 'sonner';

interface CommentsDialogProps {
  post: EnrichedSocialPost | null;
  comments: SocialComment[];
  currentUser: ClientUser | null;
  isOpen: boolean;
  isLoading: boolean;
  isSubmittingComment?: boolean;
  onClose: () => void;
  onAddComment: (variables: {
    postId: string;
    content: string;
  }) => Promise<unknown>;
  onDeleteComment: (variables: {
    postId: string;
    commentId: string;
  }) => Promise<unknown>;
}

export function CommentsDialog({
  post,
  comments,
  currentUser,
  isOpen,
  isLoading,
  isSubmittingComment,
  onClose,
  onAddComment,
  onDeleteComment,
}: CommentsDialogProps) {
  const [newComment, setNewComment] = useState('');

  if (!post) return null;

  const handleSubmitComment = async () => {
    if (!post || !newComment.trim() || isSubmittingComment) return;
    try {
      await onAddComment({ postId: post.id, content: newComment.trim() });
      setNewComment('');
      toast.success('Comentário adicionado!');
    } catch (error: any) {
      console.error('Erro ao adicionar comentário:', error);
      toast.error(error?.message || 'Não foi possível adicionar o comentário.');
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!post) return;
    try {
      await onDeleteComment({ postId: post.id, commentId: commentId });
      toast.success('Comentário removido!');
    } catch (error: any) {
      console.error('Erro ao deletar comentário:', error);
      toast.error(error?.message || 'Não foi possível deletar o comentário.');
    }
  };

  const getCommentAuthorDisplay = (authorId: string) => {
    if (currentUser?.id === authorId) {
      return {
        name: currentUser.profile.name,
        initials: currentUser.profile.name.slice(0, 1).toUpperCase() || '?',
        avatar: currentUser.profile.avatar,
      };
    }
    return {
      name: `Usuário (${authorId.substring(0, 4)})`,
      initials: '?',
      avatar: undefined,
    };
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        aria-describedby={post ? `post-content-${post.id}` : undefined}
        className='magical-border card-hover border-accent/20 bg-card/80 backdrop-blur-sm max-w-5xl h-[90vh] flex flex-col p-0'
      >
        <DialogHeader className='p-6 pb-4 flex-shrink-0'>
          <DialogTitle className='text-foreground'>Comentários</DialogTitle>
          <DialogDescription className='sr-only'>
            Comentários sobre o post de {post.author?.name}
          </DialogDescription>
        </DialogHeader>

        <div className='flex-shrink-0 px-6 pb-4'>
          <div className='bg-background/30 p-3 rounded-lg flex items-start gap-3'>
            <Avatar className='w-8 h-8 flex-shrink-0'>
              <AvatarImage src={post.author?.avatar} alt={post.author?.name} />
              <AvatarFallback>
                {post.author?.name?.slice(0, 1).toUpperCase() || '?'}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className='text-sm font-semibold text-foreground/80'>
                Post de {post.author?.name}
              </p>
              <p
                id={`post-content-${post.id}`}
                className='text-sm text-muted-foreground whitespace-pre-wrap italic'
              >
                "{post.content}"
              </p>
            </div>
          </div>
        </div>

        <div className='flex-grow overflow-y-auto px-6 space-y-4 scrollbar-hide'>
          {isLoading ? (
            <div className='flex justify-center items-center h-full'>
              <Loader2 className='w-8 h-8 animate-spin text-primary' />
            </div>
          ) : comments.length > 0 ? (
            comments.map((comment) => {
              const isAuthor = currentUser?.id === comment.authorId;
              const authorDisplay = getCommentAuthorDisplay(comment.authorId);

              return (
                <div
                  key={comment.id}
                  className='group flex items-start gap-3 animate-fade-in'
                >
                  <Avatar className='w-8 h-8 flex-shrink-0'>
                    <AvatarImage
                      src={authorDisplay.avatar}
                      alt={authorDisplay.name}
                    />
                    <AvatarFallback>{authorDisplay.initials}</AvatarFallback>
                  </Avatar>

                  <div
                    className={cn(
                      'rounded-lg p-2.5 flex-1 min-w-0',
                      isAuthor ? 'bg-primary/10' : 'bg-muted/50',
                    )}
                  >
                    <div className='flex justify-between items-center mb-1 gap-2'>
                      <div className='flex items-center gap-2 min-w-0'>
                        <p className='text-sm font-semibold text-foreground/90 truncate'>
                          {authorDisplay.name}
                        </p>
                        <span className='text-xs text-muted-foreground flex-shrink-0'>
                          •{' '}
                          {new Date(comment.timestamp).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      {isAuthor && (
                        <Button
                          variant='ghost'
                          size='icon'
                          className='h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive flex-shrink-0'
                          onClick={() => handleDeleteComment(comment.id)}
                          aria-label='Deletar comentário'
                        >
                          <Trash2 className='w-4 h-4' />
                        </Button>
                      )}
                    </div>
                    <p className='text-sm text-foreground/80 whitespace-pre-wrap break-words'>
                      {comment.content}
                    </p>
                  </div>
                </div>
              );
            })
          ) : (
            <div className='flex flex-col items-center justify-center h-full text-muted-foreground gap-2'>
              <Ghost className='w-10 h-10' />
              <p>Nenhum comentário ainda. Seja o primeiro!</p>
            </div>
          )}
        </div>

        <div className='flex-shrink-0 flex gap-2 p-6 pt-4 border-t border-border/20'>
          <Input
            placeholder={
              currentUser
                ? 'Escreva um comentário...'
                : 'Faça login para comentar...'
            }
            value={newComment}
            onChange={(event) => setNewComment(event.target.value)}
            disabled={isSubmittingComment || !currentUser}
            onKeyDown={(event) =>
              event.key === 'Enter' && !event.shiftKey && handleSubmitComment()
            }
            aria-label='Novo comentário'
          />
          <Button
            onClick={handleSubmitComment}
            disabled={!newComment.trim() || isSubmittingComment || !currentUser}
            aria-label='Enviar comentário'
          >
            {isSubmittingComment ? (
              <Loader2 className='w-4 h-4 animate-spin' />
            ) : (
              <Send className='w-4 h-4' />
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
