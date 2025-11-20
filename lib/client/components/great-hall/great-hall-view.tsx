'use client';

import { useMemo, useState } from 'react';
import { BookOpen, MessageCircle, Trophy } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useAuthActions } from '@/lib/client/contexts/auth-context';
import { useClassStore } from '@/lib/client/store/class-store';
import { housesData } from '@/lib/core/domain/house';
import type { EnrichedClass } from '@/lib/core/types/class.type';
import type { EnrichedForumPost } from '@/lib/core/types/forum.type';
import type { ClientUser } from '@/lib/core/types/user.type';
import type {
  GreatHallData,
  OnlineUser,
} from '@/lib/client/hooks/great-hall/use-great-hall';
import { Header } from '@/lib/client/components/great-hall/header';
import { ClassInfoHeader } from '@/lib/client/components/class/class-info-header';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/lib/client/components/ui/tabs';
import { SocialFeed } from '@/lib/client/components/great-hall/social-feed';
import { Forum } from '@/lib/client/components/great-hall/forum';
import { ForumPostDetail } from '@/lib/client/components/great-hall/forum-post-detail';
import { Ranking } from '@/lib/client/components/great-hall/ranking';
import { Sidebar } from '@/lib/client/components/great-hall/sidebar';
import { NewForumPost } from '@/lib/client/components/great-hall/new-forum-post';

type GreatHallViewProps = {
  classInfo: EnrichedClass;
  user: ClientUser;
  data: GreatHallData;
  onlineUsers: OnlineUser[];
  onRefetch: () => void;
};

export function GreatHallView({
  classInfo,
  user,
  data,
  onlineUsers,
  onRefetch,
}: GreatHallViewProps) {
  const { logout } = useAuthActions();
  const { clearClass } = useClassStore();
  const router = useRouter();

  const [selectedForumPost, setSelectedForumPost] =
    useState<EnrichedForumPost | null>(null);
  const [showNewForumPost, setShowNewForumPost] = useState(false);
  const [activeTab, setActiveTab] = useState('feed');

  const { studentRanking, houseStats } = data;

  const sidebarHouseStats = useMemo(() => {
    const sortedStats = [...houseStats].sort((a, b) => b.totalXp - a.totalXp);
    return sortedStats.map((stat, index) => {
      const houseInfo = housesData[stat.houseId as keyof typeof housesData];
      return {
        name: houseInfo?.name || stat.houseId,
        icon: houseInfo?.icon || '❓',
        points: stat.totalXp,
        position: index + 1,
      };
    });
  }, [houseStats]);

  const handleChangeClass = () => {
    clearClass();
    router.push('/select-class');
  };

  const handleBackToForum = () => {
    setSelectedForumPost(null);
    setActiveTab('forum');
  };

  const handleNewForumPostSuccess = () => {
    setShowNewForumPost(false);
    onRefetch();
    setActiveTab('forum');
    toast.success('Pergunta criada com sucesso!');
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-background via-card to-background'>
      <Header
        title='Grande Salão'
        subtitle='Conecte-se com outros bruxos'
        icon={BookOpen}
        showNavLinks={true}
        user={user}
        onLogout={logout}
      />

      <ClassInfoHeader
        classInfo={classInfo}
        onChangeClass={handleChangeClass}
      />

      <main className='container mx-auto px-4 py-4 md:py-8'>
        <div className='grid grid-cols-1 lg:grid-cols-4 gap-4 md:gap-6'>
          <div className='lg:col-span-3'>
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className='space-y-4 md:space-y-6'
            >
              <TabsList className='grid w-full grid-cols-3 bg-card h-12 md:h-auto'>
                <TabsTrigger
                  value='feed'
                  className='flex items-center gap-1 md:gap-2 text-xs md:text-sm'
                >
                  <MessageCircle className='w-3 h-3 md:w-4 md:h-4' />
                  Feed Social
                </TabsTrigger>
                <TabsTrigger
                  value='forum'
                  className='flex items-center gap-1 md:gap-2 text-xs md:text-sm'
                >
                  <BookOpen className='w-3 h-3 md:w-4 md:h-4' />
                  Fórum
                </TabsTrigger>
                <TabsTrigger
                  value='ranking'
                  className='flex items-center gap-1 md:gap-2 text-xs md:text-sm'
                >
                  <Trophy className='w-3 h-3 md:w-4 md:h-4' />
                  Ranking
                </TabsTrigger>
              </TabsList>

              <TabsContent value='feed'>
                <SocialFeed classId={classInfo.id} user={user} />
              </TabsContent>
              <TabsContent value='forum'>
                {selectedForumPost ? (
                  <ForumPostDetail
                    onBack={handleBackToForum}
                    post={selectedForumPost}
                    classId={classInfo.id}
                  />
                ) : (
                  <Forum
                    classId={classInfo.id}
                    onNewPost={() => setShowNewForumPost(true)}
                    onPostClick={setSelectedForumPost}
                  />
                )}
              </TabsContent>
              <TabsContent value='ranking'>
                <Ranking houseStats={houseStats} students={studentRanking} />
              </TabsContent>
            </Tabs>
          </div>
          <aside className='hidden lg:block'>
            <Sidebar houseStats={sidebarHouseStats} onlineUsers={onlineUsers} />
          </aside>
        </div>
      </main>
      <NewForumPost
        open={showNewForumPost}
        onOpenChange={setShowNewForumPost}
        onSuccess={handleNewForumPostSuccess}
        classId={classInfo.id}
      />
    </div>
  );
}
