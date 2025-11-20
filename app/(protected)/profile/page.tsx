'use client';

import {
  User as UserIcon,
  Mail,
  BarChart3,
  TrendingUp,
  Star,
  Coins,
  Gem,
  Languages,
  Cog,
  Bell,
  Zap,
} from 'lucide-react';

import {
  useAuthState,
  useAuthActions,
} from '@/lib/client/contexts/auth-context';
import { useClassStore } from '@/lib/client/store/class-store';
import { housesData } from '@/lib/core/domain/house';

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/lib/client/components/ui/avatar';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/lib/client/components/ui/card';
import { Badge } from '@/lib/client/components/ui/badge';
import { Separator } from '@/lib/client/components/ui/separator';

import { cn } from '@/lib/core/utils/utils';
import { AuthenticatedLayout } from '@/lib/client/components/layout/AuthenticatedLayout';
import { LoadingScreen } from '@/lib/client/components/loading-screen';
import { Header } from '@/lib/client/components/great-hall/header';

function ProfilePageContent() {
  const { user } = useAuthState();
  const { logout } = useAuthActions();
  const { classInfo } = useClassStore();

  if (!user || !classInfo) {
    console.error('ProfilePageContent renderizado sem user ou classInfo!');
    return <LoadingScreen message='Aguardando dados...' />;
  }

  const houseInfo = user.house
    ? housesData[user.house as keyof typeof housesData]
    : null;
  const userProgressInClass = classInfo.users?.[user.id]?.progress;

  const getInitials = (name?: string): string => {
    if (!name) return '?';
    return (
      name
        .split(' ')
        .map((n) => n?.[0] ?? '')
        .join('')
        .toUpperCase() || '?'
    );
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-background via-card to-background'>
      <Header
        title='Meu Perfil'
        subtitle='Gerencie suas informações e progresso'
        icon={UserIcon}
        showBackButton={true}
        showCurrency='galleons'
        user={user}
        classInfo={classInfo}
        onLogout={logout}
      />

      <div className='container mx-auto px-4 py-8'>
        <Card className='max-w-3xl mx-auto magical-border card-hover border-accent/20 bg-card/70 backdrop-blur-sm'>
          <CardHeader className='items-center text-center pt-8'>
            <div className='relative mb-4'>
              <Avatar className='w-28 h-28 border-4 border-primary shadow-lg'>
                <AvatarImage
                  src={user.profile.avatar}
                  alt={user.profile.name}
                  onError={(event) => {
                    (event.target as HTMLImageElement).src =
                      `https://placehold.co/112x112/${houseInfo?.colors?.slice(1) ?? 'cccccc'}/FFFFFF?text=${getInitials(user.profile.name)}`;
                  }}
                />
                <AvatarFallback
                  className={`${houseInfo?.tailwindGradient ?? 'bg-gray-500'} text-white text-4xl font-bold`}
                >
                  {getInitials(user.profile.name)}
                </AvatarFallback>
              </Avatar>
            </div>
            <CardTitle className='text-3xl font-bold'>
              {user.profile.name}
            </CardTitle>
            <CardDescription className='flex items-center gap-2'>
              <span className={`text-2xl ${houseInfo?.colors ?? ''}`}>
                {houseInfo?.icon || '❓'}
              </span>
              <span className={`font-semibold ${houseInfo?.colors ?? ''}`}>
                {houseInfo?.name || user.house}
              </span>
            </CardDescription>
          </CardHeader>

          <CardContent className='px-6 pb-8 space-y-6'>
            {userProgressInClass && (
              <>
                <Separator />
                <div className='space-y-4'>
                  <h3 className='text-lg font-semibold text-foreground/90 flex items-center gap-2'>
                    <BarChart3 className='w-5 h-5' /> Progresso em "
                    {classInfo.name}"
                  </h3>
                  <div className='grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm'>
                    <div className='flex flex-col items-center gap-1 bg-muted/30 p-3 rounded-md text-center ring-1 ring-inset ring-border/10'>
                      <Zap className='w-5 h-5 text-primary mb-1' />
                      <p className='font-bold text-lg text-primary'>
                        {userProgressInClass.xp.toLocaleString()}
                      </p>
                      <p className='text-muted-foreground text-xs'>XP Total</p>
                    </div>
                    <div className='flex flex-col items-center gap-1 bg-muted/30 p-3 rounded-md text-center ring-1 ring-inset ring-border/10'>
                      <Star className='w-5 h-5 text-yellow-500 mb-1' />
                      <p className='font-bold text-lg'>
                        {userProgressInClass.level}
                      </p>
                      <p className='text-muted-foreground text-xs'>Nível</p>
                    </div>
                    <div className='flex flex-col items-center gap-1 bg-muted/30 p-3 rounded-md text-center ring-1 ring-inset ring-border/10'>
                      <TrendingUp className='w-5 h-5 text-green-500 mb-1' />
                      <p className='font-bold text-lg'>
                        {userProgressInClass.streak}
                      </p>
                      <p className='text-muted-foreground text-xs'>
                        Streak (Dias)
                      </p>
                    </div>
                    <div className='flex flex-col items-center gap-1 bg-muted/30 p-3 rounded-md text-center ring-1 ring-inset ring-border/10'>
                      <Coins className='w-5 h-5 text-yellow-600 mb-1' />
                      <p className='font-bold text-lg'>
                        {userProgressInClass.currencies.galleons}
                      </p>
                      <p className='text-muted-foreground text-xs'>Galeões</p>
                      {userProgressInClass.currencies.gems > 0 && (
                        <div className='flex items-center gap-1 mt-1'>
                          <Gem className='w-3 h-3 text-blue-400' />
                          <span className='font-bold text-xs'>
                            {userProgressInClass.currencies.gems}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}

            <Separator />
            <div className='space-y-4'>
              <h3 className='text-lg font-semibold text-foreground/90 flex items-center gap-2'>
                <UserIcon className='w-5 h-5' /> Detalhes do Bruxo
              </h3>
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm'>
                <div className='flex items-center gap-3 bg-muted/30 p-3 rounded-md ring-1 ring-inset ring-border/10'>
                  <Mail className='w-5 h-5 text-muted-foreground flex-shrink-0' />
                  <div>
                    <p className='text-muted-foreground text-xs'>Email</p>
                    <p className='font-medium truncate'>{user.email}</p>
                  </div>
                </div>
                <div className='flex items-center gap-3 bg-muted/30 p-3 rounded-md ring-1 ring-inset ring-border/10'>
                  <UserIcon className='w-5 h-5 text-muted-foreground flex-shrink-0' />
                  <div>
                    <p className='text-muted-foreground text-xs'>Função</p>
                    <p className='font-medium capitalize'>{user.role}</p>
                  </div>
                </div>
              </div>
            </div>

            <Separator />
            <div className='space-y-4'>
              <h3 className='text-lg font-semibold text-foreground/90 flex items-center gap-2'>
                <Cog className='w-5 h-5' /> Preferências
              </h3>
              <div className='grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm'>
                <div className='bg-muted/30 p-3 rounded-md ring-1 ring-inset ring-border/10'>
                  <p className='text-muted-foreground text-xs mb-1 flex items-center gap-1'>
                    <Languages className='w-4 h-4' /> Idioma
                  </p>
                  <p className='font-medium'>
                    {user.preferences.language === 'pt-BR'
                      ? 'Português (BR)'
                      : 'Inglês (US)'}
                  </p>
                </div>
                <div className='bg-muted/30 p-3 rounded-md ring-1 ring-inset ring-border/10'>
                  <p className='text-muted-foreground text-xs mb-1'>Tema</p>
                  <p className='font-medium capitalize'>
                    {user.preferences.theme}
                  </p>
                </div>
                <div className='bg-muted/30 p-3 rounded-md ring-1 ring-inset ring-border/10'>
                  <p className='text-muted-foreground text-xs mb-1 flex items-center gap-1'>
                    <Bell className='w-4 h-4' /> Notificações
                  </p>
                  <Badge
                    variant={
                      user.preferences.notifications ? 'default' : 'secondary'
                    }
                    className={cn(
                      'text-xs',
                      user.preferences.notifications
                        ? 'bg-green-600/80 border-green-600/30 text-white'
                        : 'bg-red-600/80 border-red-600/30 text-white',
                    )}
                  >
                    {user.preferences.notifications
                      ? 'Ativadas'
                      : 'Desativadas'}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function ProfilePageWithLayout() {
  return (
    <AuthenticatedLayout>
      <ProfilePageContent />
    </AuthenticatedLayout>
  );
}
