'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useAuthState } from '@/lib/client/contexts/auth-context';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/lib/client/components/ui/avatar';
import { Button } from '@/lib/client/components/ui/button';
import { Card, CardContent } from '@/lib/client/components/ui/card';
import { Textarea } from '@/lib/client/components/ui/textarea';
import type { EnrichedSocialPost } from '@/lib/core/types/social.type';

interface NewPostFormProps {
  onCreatePost: (content: string) => Promise<EnrichedSocialPost>;
  isSubmitting: boolean;
}

export function NewPostForm({ onCreatePost, isSubmitting }: NewPostFormProps) {
  const { user } = useAuthState();
  const [content, setContent] = useState('');

  const handleSubmit = async () => {
    if (!content.trim()) return;
    await onCreatePost(content.trim());
    setContent('');
  };

  const userInitials =
    user?.profile.name
      .split(' ')
      .map((name) => name[0])
      .join('') || 'U';

  return (
    <Card>
      <CardContent className='p-4'>
        <div className='flex items-start gap-4'>
          <Avatar className='w-10 h-10 flex-shrink-0'>
            <AvatarImage src={user?.profile.avatar} alt={user?.profile.name} />
            <AvatarFallback>{userInitials}</AvatarFallback>
          </Avatar>

          <div className='flex-1 space-y-3 min-w-0'>
            <Textarea
              placeholder='Compartilhe algo com a turma...'
              value={content}
              onChange={(e) => setContent(e.target.value)}
              disabled={isSubmitting}
              rows={3}
            />
            <div className='flex justify-end'>
              <Button
                onClick={handleSubmit}
                disabled={!content.trim() || isSubmitting}
              >
                <Plus className='w-4 h-4 mr-2' />
                {isSubmitting ? 'Publicando...' : 'Publicar'}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
