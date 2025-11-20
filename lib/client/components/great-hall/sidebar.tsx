'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/lib/client/components/ui/card';
import { Avatar, AvatarFallback } from '@/lib/client/components/ui/avatar';
import { Users, Trophy, Crown, Ghost } from 'lucide-react';
import { OnlineUser } from '@/lib/client/hooks/great-hall/use-great-hall';
import { EmptyState } from '../ui/empty-state';
import { housesData } from '@/lib/core/domain/house';

type HouseData = {
  name: string;
  position: number;
  icon: string;
  points: number;
};

interface SidebarProps {
  onlineUsers: OnlineUser[];
  houseStats: HouseData[];
}

export function Sidebar({ onlineUsers, houseStats }: SidebarProps) {
  return (
    <div className='space-y-6'>
      {/* Card de Bruxos Online */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2 text-lg'>
            <Users className='w-5 h-5 text-green-500' />
            Bruxos Online
          </CardTitle>
        </CardHeader>
        <CardContent className='p-4'>
          {onlineUsers.length > 0 ? (
            <div className='space-y-3'>
              {onlineUsers.map((user) => (
                <div key={user.id} className='flex items-center gap-3'>
                  <div className='relative'>
                    <Avatar className='w-8 h-8'>
                      <AvatarFallback
                        className={`bg-gradient-to-br ${housesData[user.house].tailwindGradient} text-white text-xs`}
                      >
                        {user.name
                          .split(' ')
                          .map((name: string) => name[0])
                          .join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className='absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-background' />
                  </div>
                  <div className='flex-1 min-w-0'>
                    <div className='text-sm font-medium truncate'>
                      {user.name}
                    </div>
                    <div className='text-xs text-muted-foreground truncate'>
                      {user.status}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              message='Ninguém online no momento. Um silêncio fantasmagórico...'
              icon={Ghost}
            />
          )}
        </CardContent>
      </Card>

      {/* Card do Ranking das Casas */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2 text-lg'>
            <Trophy className='w-5 h-5 text-accent' />
            Ranking das Casas
          </CardTitle>
        </CardHeader>
        <CardContent className='p-4'>
          {houseStats.length > 0 ? (
            <div className='space-y-3'>
              {houseStats.map((house) => (
                <div key={house.name} className='flex items-center gap-3'>
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      house.position === 1
                        ? 'bg-yellow-500 text-black'
                        : house.position === 2
                          ? 'bg-gray-400 text-white'
                          : house.position === 3
                            ? 'bg-amber-600 text-white'
                            : 'bg-gray-600 text-white'
                    }`}
                  >
                    {house.position}
                  </div>
                  <span className='text-lg'>{house.icon}</span>
                  <div className='flex-1'>
                    <div className='text-sm font-medium'>{house.name}</div>
                    <div className='text-xs text-muted-foreground'>
                      {house.points} pontos
                    </div>
                  </div>
                  {house.position === 1 && (
                    <Crown className='w-4 h-4 text-yellow-500' />
                  )}
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              message='O ranking das casas ainda não foi calculado.'
              icon={Trophy}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
