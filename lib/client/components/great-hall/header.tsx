'use client';

import {
  type LucideIcon,
  ArrowLeft,
  BookOpen,
  ShoppingBag,
  LogOut,
  User as UserIcon,
  Sparkles,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useMemo } from 'react';

import { Button } from '@/lib/client/components/ui/button';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/lib/client/components/ui/avatar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/lib/client/components/ui/popover';
import type { ClientUser } from '@/lib/core/types/user.type';
import type { EnrichedClass } from '@/lib/core/types/class.type';
import { housesData } from '@/lib/core/domain/house';

const iconMap: Record<string, LucideIcon | string> = {
  potions: '🧪',
  shop: Sparkles,
  profile: UserIcon,
  greatHall: BookOpen,
};

interface HeaderProperties {
  title: string;
  subtitle?: string;
  icon?: LucideIcon | string;
  showBackButton?: boolean;
  backButtonHref?: string;
  showNavLinks?: boolean;
  showCurrency?: 'galleons' | 'all';
  user: ClientUser;
  classInfo?: EnrichedClass | null;
  onLogout: () => void;
}

export function Header({
  title,
  subtitle,
  icon: IconProp = Sparkles,
  showBackButton = false,
  backButtonHref,
  showNavLinks = false,
  showCurrency,
  user,
  classInfo,
  onLogout,
}: HeaderProperties) {
  const router = useRouter();

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

  const userHouse = useMemo(() => {
    const house = housesData[user.house];
    return { id: user.house, house };
  }, [user.house]);

  const houseColorClass = userHouse?.house?.tailwindGradient || 'bg-gray-500';

  const userCurrencies = useMemo(() => {
    if (!classInfo || !user) return { galleons: 0, sickles: 0, knuts: 0 };
    const progress = classInfo.users?.[user.id]?.progress;
    return {
      galleons: progress?.currencies.galleons ?? 0,
      sickles: progress?.currencies.sickles ?? 0,
      knuts: progress?.currencies.knuts ?? 0,
    };
  }, [classInfo, user]);

  const handleBackClick = () => {
    if (backButtonHref) {
      router.push(backButtonHref);
    } else {
      router.back();
    }
  };

  const HeaderIcon =
    typeof IconProp === 'string' ? iconMap[IconProp] || IconProp : IconProp;
  const isEmojiIcon =
    typeof HeaderIcon === 'string' && /\p{Emoji}/u.test(HeaderIcon);

  return (
    <header className='border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50'>
      <div className='container mx-auto px-4 py-3 sm:py-4'>
        <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4'>
          <div className='flex items-center gap-2 sm:gap-4 flex-grow min-w-0'>
            {showBackButton && (
              <Button
                variant='ghost'
                size='sm'
                onClick={handleBackClick}
                className='text-muted-foreground hover:text-foreground -ml-2 sm:ml-0'
              >
                <ArrowLeft className='w-4 h-4 mr-1 sm:mr-2' />
                <span className='hidden sm:inline'>Voltar</span>
              </Button>
            )}
            <div className='flex items-center gap-3 flex-shrink min-w-0'>
              <div className='w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-accent to-primary flex items-center justify-center animate-sparkle shadow-lg flex-shrink-0'>
                {isEmojiIcon ? (
                  <span className='text-lg sm:text-xl'>{HeaderIcon}</span>
                ) : (
                  <HeaderIcon className='w-4 h-4 sm:w-5 sm:h-5 text-white' />
                )}
              </div>
              <div className='flex-grow min-w-0'>
                <h1 className='text-lg sm:text-xl font-bold text-chroma truncate'>
                  {title}
                </h1>
                {subtitle && (
                  <p className='text-xs sm:text-sm text-muted-foreground truncate'>
                    {subtitle}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className='flex items-center gap-2 sm:gap-4 w-full sm:w-auto justify-end'>
            {showNavLinks && (
              <div className='hidden md:flex items-center gap-1'>
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={() => router.push('/potions')}
                >
                  <BookOpen className='w-4 h-4 mr-1' /> Poções
                </Button>
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={() => router.push('/shop')}
                >
                  <ShoppingBag className='w-4 h-4 mr-1' /> Beco Diagonal
                </Button>
              </div>
            )}

            {showCurrency && (
              <div className='flex items-center gap-1 sm:gap-2 bg-card/50 rounded-lg px-2 sm:px-3 py-1 sm:py-2 whitespace-nowrap border border-border/20'>
                {showCurrency === 'galleons' || showCurrency === 'all' ? (
                  <>
                    <span className='text-base sm:text-lg text-yellow-500'>
                      🥇
                    </span>
                    <span className='font-semibold text-xs sm:text-sm'>
                      {userCurrencies.galleons}
                    </span>
                    <span className='text-xs text-muted-foreground hidden sm:inline ml-1'>
                      Galeões
                    </span>
                  </>
                ) : null}
                {showCurrency === 'all' && (
                  <>
                    <span className='text-base sm:text-lg ml-2'>🥈</span>
                    <span className='font-semibold text-xs sm:text-sm'>
                      {userCurrencies.sickles}
                    </span>
                    <span className='text-xs text-muted-foreground hidden sm:inline ml-1'>
                      Sicles
                    </span>
                    <span className='text-base sm:text-lg ml-2'>🥉</span>
                    <span className='font-semibold text-xs sm:text-sm'>
                      {userCurrencies.knuts}
                    </span>
                    <span className='text-xs text-muted-foreground hidden sm:inline ml-1'>
                      Nuques
                    </span>
                  </>
                )}
              </div>
            )}

            <Popover>
              <PopoverTrigger asChild>
                <Avatar className='border-2 border-primary cursor-pointer hover:scale-110 transition-transform duration-200 w-8 h-8 sm:w-10 sm:h-10'>
                  <AvatarImage
                    src={user.profile.avatar}
                    alt={user.profile.name}
                  />
                  <AvatarFallback
                    className={`${houseColorClass} text-white font-bold text-xs sm:text-sm`}
                  >
                    {getInitials(user.profile.name)}
                  </AvatarFallback>
                </Avatar>
              </PopoverTrigger>
              <PopoverContent className='w-56 p-2' sideOffset={10}>
                <div className='flex flex-col space-y-1'>
                  <div className='px-2 py-1.5 text-sm font-semibold truncate'>
                    {user.profile.name}
                  </div>
                  <div className='px-2 py-1.5 text-xs text-muted-foreground truncate'>
                    {user.email}
                  </div>
                  <Button
                    variant='ghost'
                    size='sm'
                    className='w-full justify-start text-sm'
                    onClick={() => router.push('/profile')}
                  >
                    <UserIcon className='w-4 h-4 mr-2' /> Meu Perfil
                  </Button>
                  {showNavLinks && (
                    <div className='md:hidden border-t border-border pt-1 mt-1'>
                      <Button
                        variant='ghost'
                        size='sm'
                        className='w-full justify-start text-sm'
                        onClick={() => router.push('/potions')}
                      >
                        <BookOpen className='w-4 h-4 mr-2' /> Poções
                      </Button>
                      <Button
                        variant='ghost'
                        size='sm'
                        className='w-full justify-start text-sm'
                        onClick={() => router.push('/shop')}
                      >
                        <ShoppingBag className='w-4 h-4 mr-2' /> Beco Diagonal
                      </Button>
                    </div>
                  )}
                  <Button
                    variant='ghost'
                    size='sm'
                    className='w-full justify-start text-sm text-destructive hover:text-destructive border-t border-border mt-1 pt-2'
                    onClick={onLogout}
                  >
                    <LogOut className='w-4 h-4 mr-2' /> Sair
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>
    </header>
  );
}
