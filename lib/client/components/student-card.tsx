'use client';

import { Card, CardContent } from '@/lib/client/components/ui/card';
import { Badge } from '@/lib/client/components/ui/badge';
import { Avatar, AvatarFallback } from '@/lib/client/components/ui/avatar';
import { Progress } from '@/lib/client/components/ui/progress';
import { Flame, Trophy } from 'lucide-react';

interface StudentCardProps {
  student: {
    name: string;
    house: string;
    year: number;
    xp: number;
    nextLevelXp: number;
    streak: number;
    achievements: number;
  };
  onClick?: () => void;
}

export function StudentCard({ student, onClick }: StudentCardProps) {
  const houses = {
    gryffindor: {
      name: 'Grifinória',
      colors: 'from-red-600 to-yellow-500',
      icon: '🦁',
    },
    slytherin: {
      name: 'Sonserina',
      colors: 'from-green-600 to-gray-500',
      icon: '🐍',
    },
    ravenclaw: {
      name: 'Corvinal',
      colors: 'from-blue-600 to-purple-500',
      icon: '🦅',
    },
    hufflepuff: {
      name: 'Lufa-Lufa',
      colors: 'from-yellow-500 to-black',
      icon: '🦡',
    },
  };

  const currentHouse = houses[student.house as keyof typeof houses];

  return (
    <Card
      className='hover:shadow-lg transition-all cursor-pointer'
      onClick={onClick}
    >
      <CardContent className='p-4'>
        <div className='flex items-center gap-3 mb-3'>
          <div className='relative'>
            <Avatar className='w-12 h-12 border-2 border-primary'>
              <AvatarFallback
                className={`bg-gradient-to-br ${currentHouse.colors} text-white`}
              >
                {student.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')}
              </AvatarFallback>
            </Avatar>
            <div className='absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-gradient-to-br from-accent to-primary flex items-center justify-center text-xs'>
              {currentHouse.icon}
            </div>
          </div>

          <div className='flex-1'>
            <h3 className='font-semibold'>{student.name}</h3>
            <div className='flex items-center gap-2'>
              <Badge variant='secondary' className='text-xs'>
                {student.year}º Ano
              </Badge>
              <Badge
                className={`bg-gradient-to-r ${currentHouse.colors} text-white text-xs`}
              >
                {currentHouse.name}
              </Badge>
            </div>
          </div>
        </div>

        <div className='space-y-2'>
          <div className='flex justify-between text-sm'>
            <span>XP: {student.xp}</span>
            <span className='text-muted-foreground'>
              {student.nextLevelXp - student.xp} para próximo nível
            </span>
          </div>
          <Progress
            value={(student.xp / student.nextLevelXp) * 100}
            className='h-2'
          />
        </div>

        <div className='flex justify-between items-center mt-3 text-sm'>
          <div className='flex items-center gap-1 text-orange-500'>
            <Flame className='w-4 h-4' />
            <span>{student.streak}d</span>
          </div>
          <div className='flex items-center gap-1 text-accent'>
            <Trophy className='w-4 h-4' />
            <span>{student.achievements}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
