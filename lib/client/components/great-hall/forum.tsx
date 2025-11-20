'use client';

import { Eye, MessageCircle, Plus, Search, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import { useAuthState } from '@/lib/client/contexts/auth-context';
import { useForum } from '@/lib/client/hooks/great-hall/use-forum';
import type { EnrichedForumPost } from '@/lib/core/types/forum.type';

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/lib/client/components/ui/avatar';
import { Button } from '@/lib/client/components/ui/button';
import { Card, CardContent } from '@/lib/client/components/ui/card';
import { Input } from '@/lib/client/components/ui/input';
import { LoadingScreen } from '@/lib/client/components/loading-screen';

type ForumProps = {
  classId: string;
  onPostClick: (post: EnrichedForumPost) => void;
  onNewPost: () => void;
};

export function Forum({ classId, onPostClick, onNewPost }: ForumProps) {
  const { user } = useAuthState();
  const {
    isLoading,
    searchTerm,
    setSearchTerm,
    filteredPosts,
    incrementView,
    deletePost,
  } = useForum(classId, user);

  const handlePostClick = (post: EnrichedForumPost) => {
    incrementView(post.id);
    onPostClick(post);
  };

  if (isLoading) return <LoadingScreen message='Carregando fórum...' />;

  return (
    <div className='space-y-6'>
      <Card className='bg-card/50'>
        <CardContent className='p-4'>
          <div className='flex flex-wrap items-center gap-2 md:gap-4'>
            <div className='flex-1 relative min-w-[200px]'>
              <Input
                className='w-full pr-10'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder='Buscar por título ou conteúdo...'
              />
              <Search className='absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
            </div>
            <Button onClick={onNewPost} variant='outline'>
              <Plus className='w-4 h-4 mr-2' />
              Nova Pergunta
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className='space-y-4'>
        {filteredPosts.length === 0 ? (
          <Card className='bg-card/50'>
            <CardContent className='p-8 text-center text-muted-foreground'>
              Nenhum resultado encontrado.
            </CardContent>
          </Card>
        ) : (
          filteredPosts.map((post) => (
            <Card
              key={post.id}
              className='hover:shadow-lg transition-shadow cursor-pointer magical-border bg-card/50'
              onClick={() => handlePostClick(post)}
            >
              <CardContent className='p-4'>
                <div className='flex gap-4'>
                  <Avatar className='w-10 h-10 border-2 border-primary/20'>
                    <AvatarImage
                      src={post.author.avatar}
                      alt={post.author.name}
                    />
                    <AvatarFallback>
                      {post.author.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className='flex-1 min-w-0'>
                    <h3 className='font-semibold text-lg hover:text-primary transition-colors truncate'>
                      {post.title}
                    </h3>
                    <p className='text-sm text-muted-foreground'>
                      por{' '}
                      <span className='font-semibold text-foreground'>
                        {post.author.name}
                      </span>{' '}
                      •{' '}
                      {formatDistanceToNow(new Date(post.createdAt), {
                        addSuffix: true,
                        locale: ptBR,
                      })}
                    </p>
                    <div className='flex items-center justify-between mt-4 pt-2 border-t border-border/20'>
                      <div className='flex items-center gap-4 text-sm text-muted-foreground'>
                        <span className='flex items-center gap-1.5'>
                          <MessageCircle className='w-4 h-4' />{' '}
                          {post.replies.length}
                        </span>
                        <span className='flex items-center gap-1.5'>
                          <Eye className='w-4 h-4' /> {post.views}
                        </span>
                      </div>
                      {user?.id === post.authorId && (
                        <Button
                          variant='ghost'
                          size='icon'
                          className='h-7 w-7 text-muted-foreground hover:bg-destructive/20 hover:text-destructive'
                          onClick={(e) => {
                            e.stopPropagation();
                            deletePost(post.id);
                          }}
                        >
                          <Trash2 className='w-4 h-4' />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
