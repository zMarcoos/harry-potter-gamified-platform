'use client';

import { useState } from 'react';
import { Heart, MessageCircle, Share, Trash2, Check } from 'lucide-react';
import { toast } from 'sonner';

import { EnrichedSocialPost } from '@/lib/core/types/social.type';
import { ClientUser } from '@/lib/core/types/user.type';
import { Avatar, AvatarFallback, AvatarImage } from '@/lib/client/components/ui/avatar';
import { Button } from '@/lib/client/components/ui/button';
import { Card, CardContent } from '@/lib/client/components/ui/card';
import { cn } from '@/lib/core/utils/utils';

interface PostCardProps {
  post: EnrichedSocialPost;
  currentUser: ClientUser | null;
  classId: string;
  onToggleLike: (postId: string) => void;
  onDeletePost: (postId: string) => void;
  onOpenComments: () => void;
}

export function PostCard({ post, currentUser, onToggleLike, onDeletePost, onOpenComments }: PostCardProps) {
  const [isCopied, setIsCopied] = useState(false);

  const isLiked = currentUser ? post.likes.includes(currentUser.id) : false;
  const isAuthor = currentUser ? post.authorId === currentUser.id : false;

  const handleShare = async () => {
    const url = `${window.location.origin}/great-hall#post-${post.id}`;
    await navigator.clipboard.writeText(url);
    setIsCopied(true);
    toast.success('Link do post copiado!');
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <Card
      id={`post-${post.id}`}
      className="magical-border card-hover border-accent/20 bg-card/60 backdrop-blur-sm transition-all duration-300"
    >
      <CardContent className='p-4'>
        <div className='flex gap-4'>
          <Avatar className='w-10 h-10'>
            <AvatarImage src={post.author.avatar} alt={post.author.name} />
            <AvatarFallback className="bg-muted text-muted-foreground text-sm">
              {post.author.name?.split(' ').map(n => n[0]).join('').toUpperCase() || '?'}
            </AvatarFallback>
          </Avatar>

          <div className='flex-1'>
            <div className='flex items-center gap-2 mb-2'>
              <span className='font-semibold text-foreground/90'>{post.author.name}</span>
              <span className='text-xs text-muted-foreground ml-auto'>
                {new Date(post.timestamp).toLocaleString()}
              </span>
            </div>

            <p className='text-sm mb-4 whitespace-pre-wrap leading-relaxed text-foreground/80'>
              {post.content}
            </p>

            <div className='flex items-center gap-1 text-sm text-muted-foreground border-t border-border/20 pt-2'>
              <Button
                variant='ghost'
                size='sm'
                className={cn(
                  'transition-colors p-2 h-auto',
                  isLiked ? 'text-red-500 hover:text-red-600' : 'hover:text-red-500'
                )}
                onClick={() => onToggleLike(post.id)}
              >
                <Heart className={cn('w-4 h-4 mr-1.5 transition-transform', isLiked ? 'fill-current' : '')} />
                {post.likes.length}
              </Button>

              <Button variant='ghost' size='sm' className='transition-colors p-2 h-auto hover:text-primary' onClick={onOpenComments}>
                <MessageCircle className='w-4 h-4 mr-1.5' />
                {post.comments.length}
              </Button>

              <Button variant='ghost' size='sm' className='transition-colors p-2 h-auto hover:text-green-500' onClick={handleShare}>
                {isCopied
                  ? <><Check className='w-4 h-4 mr-1.5' /> Copiado!</>
                  : <><Share className='w-4 h-4 mr-1.5' /> Compartilhar</>
                }
              </Button>

              {isAuthor && (
                <Button
                  variant='ghost'
                  size='sm'
                  className='transition-colors p-2 h-auto hover:text-destructive ml-auto'
                  onClick={() => onDeletePost(post.id)}
                >
                  <Trash2 className='w-4 h-4' />
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
