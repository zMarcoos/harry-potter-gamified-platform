'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/lib/client/components/ui/card';
import { Badge } from '@/lib/client/components/ui/badge';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/lib/client/components/ui/avatar';
import { Trophy, Crown, TrendingUp, Ghost } from 'lucide-react';

import type { EnrichedUserRanking } from '@/lib/core/types/user.type';
import type { HouseStats } from '@/lib/core/types/house.type';
import { useRankingData } from '@/lib/client/hooks/great-hall/use-ranking-data';
import { cn } from '@/lib/core/utils/utils';
import { housesData } from '@/lib/core/domain/house';

interface RankingProps {
  students: EnrichedUserRanking[];
  houseStats: HouseStats[];
}

export function Ranking({ students, houseStats }: RankingProps) {
  const { topStudents, enrichedHouseStats } = useRankingData(
    students,
    houseStats,
  );

  const getPodiumClass = (index: number) => {
    if (index === 0) return 'ring-2 ring-primary shadow-lg shadow-primary/20';
    if (index === 1) return 'ring-2 ring-gray-400 shadow-lg shadow-gray-400/20';
    if (index === 2)
      return 'ring-2 ring-amber-600 shadow-lg shadow-amber-600/20';
    return 'border border-border/20';
  };

  const getPodiumBadgeClass = (index: number) => {
    if (index === 0) return 'bg-primary text-primary-foreground';
    if (index === 1) return 'bg-gray-400 text-white';
    if (index === 2) return 'bg-amber-600 text-white';
    return 'bg-muted text-muted-foreground';
  };

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

  const podiumLength = Math.max(0, 3 - topStudents.length);
  const podiumStudents: (EnrichedUserRanking | null)[] = [
    ...topStudents.slice(0, 3),
    ...Array.from({ length: podiumLength }, () => null),
  ];

  const fullRankingLength = Math.max(0, 5 - topStudents.length);
  const fullRankingStudents: (EnrichedUserRanking | null)[] = [
    ...topStudents.slice(0, 5),
    ...Array.from({ length: fullRankingLength }, () => null),
  ];

  return (
    <div className='space-y-8'>
      <Card className='magical-border bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20'>
        <CardHeader>
          <CardTitle className='flex items-center gap-3 text-2xl'>
            <Trophy className='w-8 h-8 text-primary animate-glow' />
            Ranking dos Estudantes
          </CardTitle>
          <p className='text-muted-foreground'>
            Os bruxos mais dedicados de Hogwarts.
          </p>
        </CardHeader>
      </Card>

      <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
        {podiumStudents.map((student, index) => (
          <Card
            key={student?.userId || `podium-empty-${index}`}
            className={cn(
              'relative overflow-hidden flex flex-col',
              getPodiumClass(index),
            )}
          >
            <CardContent className='p-6 text-center flex flex-col gap-4 items-center justify-center flex-grow'>
              <div
                className={cn(
                  'absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold',
                  getPodiumBadgeClass(index),
                )}
              >
                {index + 1}
              </div>

              <div className='h-8 mb-2 flex items-center justify-center'>
                {index === 0 && student && (
                  <Crown className='w-8 h-8 text-primary animate-glow' />
                )}
              </div>

              {student ? (
                <>
                  <Avatar className='w-24 h-24'>
                    <AvatarImage src={student.avatar} alt={student.name} />
                    <AvatarFallback
                      className={`text-2xl font-bold bg-gradient-to-br ${
                        housesData[student.house].tailwindGradient
                      }`}
                    >
                      {getInitials(student.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className='font-bold text-lg truncate'>
                      {student.name}
                    </h3>
                    <Badge variant='outline' className='capitalize'>
                      {student.house}
                    </Badge>
                  </div>
                  <div className='space-y-2 text-sm w-full pt-4 border-t border-border/20'>
                    <div className='flex justify-between'>
                      <span className='text-muted-foreground'>XP:</span>
                      <span className='font-bold text-primary'>
                        {student.xp.toLocaleString()}
                      </span>
                    </div>
                    <div className='flex justify-between'>
                      <span className='text-muted-foreground'>Streak:</span>
                      <span className='font-bold'>{student.streak} dias</span>
                    </div>
                    <div className='flex justify-between'>
                      <span className='text-muted-foreground'>Nível:</span>
                      <span className='font-bold'>{student.level}</span>
                    </div>
                  </div>
                </>
              ) : (
                <div className='text-muted-foreground text-center flex flex-col items-center justify-center gap-2 flex-grow'>
                  <Ghost className='w-12 h-12' />
                  <span>Vago</span>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <TrendingUp className='w-5 h-5' />
            Ranking Completo (Top 5)
          </CardTitle>
        </CardHeader>
        <CardContent className='p-4'>
          <div className='space-y-2'>
            {fullRankingStudents.map((student, index) =>
              student ? (
                <div
                  key={student.userId}
                  className='flex items-center gap-4 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors'
                >
                  <div
                    className={cn(
                      'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0',
                      getPodiumBadgeClass(index),
                    )}
                  >
                    {index + 1}
                  </div>
                  <Avatar className='w-12 h-12'>
                    <AvatarImage src={student.avatar} alt={student.name} />
                    <AvatarFallback
                      className={`bg-gradient-to-br ${
                        housesData[student.house].tailwindGradient
                      }`}
                    >
                      {getInitials(student.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className='flex-1 min-w-0'>
                    <h4 className='font-semibold truncate'>{student.name}</h4>
                    <Badge variant='outline' className='text-xs capitalize'>
                      {student.house}
                    </Badge>
                  </div>
                  <div className='flex items-center gap-4 text-center text-sm'>
                    <div>
                      <div className='font-bold text-primary'>
                        {student.xp.toLocaleString()}
                      </div>
                      <div className='text-xs text-muted-foreground'>XP</div>
                    </div>
                    <div>
                      <div className='font-bold'>{student.streak}</div>
                      <div className='text-xs text-muted-foreground'>
                        Streak
                      </div>
                    </div>
                    <div>
                      <div className='font-bold'>{student.level}</div>
                      <div className='text-xs text-muted-foreground'>Nível</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  key={`empty-${index}`}
                  className='flex items-center gap-4 p-3 rounded-lg border border-dashed border-border/30'
                >
                  <div
                    className={cn(
                      'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 bg-muted text-muted-foreground',
                    )}
                  >
                    {index + 1}
                  </div>
                  <div className='flex-1 text-sm text-muted-foreground italic'>
                    Posição Vaga
                  </div>
                </div>
              ),
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Trophy className='w-5 h-5 text-accent' />
            Competição entre Casas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
            {enrichedHouseStats.map((house, index) => (
              <Card
                key={house.houseId}
                className={cn(
                  'text-center',
                  index === 0 && 'magical-border ring-2 ring-primary',
                )}
              >
                <CardContent className='p-4 flex flex-col items-center gap-2'>
                  <div className='text-4xl'>{house.icon}</div>
                  <h4 className='font-bold'>{house.name}</h4>
                  <div className='text-sm w-full space-y-1 pt-2 border-t border-border/20'>
                    <div className='flex justify-between'>
                      <span>Pontos:</span>
                      <span className='font-bold text-primary'>
                        {house.totalXp.toLocaleString()}
                      </span>
                    </div>
                    <div className='flex justify-between'>
                      <span>Membros:</span>
                      <span>{house.members}</span>
                    </div>
                    <div className='flex justify-between'>
                      <span>XP Médio:</span>
                      <span>{house.avgXp.toLocaleString()}</span>
                    </div>
                  </div>
                  {index === 0 && (
                    <Crown className='w-5 h-5 text-primary mt-2' />
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
