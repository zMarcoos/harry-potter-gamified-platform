'use client';

import type { ClientUser } from '@/lib/core/types/user.type';
import { useSocialFeed } from '@/lib/client/hooks/great-hall/use-social-feed';

import { Card, CardContent } from '@/lib/client/components/ui/card';
import { LoadingScreen } from '@/lib/client/components/loading-screen';
import { NewPostForm } from './new-post-form';
import { PostCard } from './post-card';
import { CommentsDialog } from './comments-dialog';

interface SocialFeedProps {
  classId: string;
  user: ClientUser | null;
}

export function SocialFeed({ classId, user }: SocialFeedProps) {
  const {
    posts,
    isLoading,
    createPost,
    isCreatingPost,
    toggleLike,
    deletePost,
    comments,
    isCommentsLoading,
    viewingCommentsForPostId,
    fetchComments,
    closeComments,
    addComment,
    isAddingComment,
    deleteComment,
  } = useSocialFeed(classId, user);

  const viewingPost =
    posts.find((p) => p.id === viewingCommentsForPostId) || null;

  if (isLoading) {
    return <LoadingScreen message='Carregando feed social...' />;
  }

  return (
    <div className='space-y-6'>
      <NewPostForm onCreatePost={createPost} isSubmitting={isCreatingPost} />

      <div className='space-y-4'>
        {posts.length > 0 ? (
          posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              currentUser={user}
              classId={classId}
              onToggleLike={toggleLike}
              onDeletePost={deletePost}
              onOpenComments={() => fetchComments(post)}
            />
          ))
        ) : (
          <Card>
            <CardContent className='p-8 text-center text-muted-foreground'>
              Nenhum post ainda. Seja o primeiro a compartilhar algo!
            </CardContent>
          </Card>
        )}
      </div>

      <CommentsDialog
        post={viewingPost}
        comments={comments}
        currentUser={user}
        isOpen={!!viewingPost}
        isLoading={isCommentsLoading}
        isSubmittingComment={isAddingComment}
        onClose={closeComments}
        onAddComment={addComment}
        onDeleteComment={deleteComment}
      />
    </div>
  );
}
