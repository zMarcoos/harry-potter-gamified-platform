'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/lib/client/components/ui/card';
import { Button } from '@/lib/client/components/ui/button';
import { Badge } from '@/lib/client/components/ui/badge';
import { Mail, Bell, X, Check } from 'lucide-react';

interface EmailNotification {
  id: string;
  type:
    | 'quiz_completed'
    | 'new_mission'
    | 'announcement'
    | 'reward'
    | 'house_points';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  priority: 'low' | 'medium' | 'high';
}

export default function EmailNotificationSystem() {
  const [notifications, setNotifications] = useState<EmailNotification[]>([
    {
      id: '1',
      type: 'quiz_completed',
      title: 'Quiz Completado!',
      message:
        "Parabéns! Você completou o quiz 'Poção de JavaScript Básico' e ganhou 50 XP!",
      timestamp: '2 min atrás',
      isRead: false,
      priority: 'medium',
    },
    {
      id: '2',
      type: 'new_mission',
      title: 'Nova Missão Disponível',
      message:
        "A missão 'Campeão da Casa' foi adicionada. Contribua com pontos para sua casa!",
      timestamp: '1 hora atrás',
      isRead: false,
      priority: 'high',
    },
    {
      id: '3',
      type: 'announcement',
      title: 'Anúncio Global',
      message:
        'Manutenção programada no domingo das 2h às 4h. Planeje seus estudos!',
      timestamp: '3 horas atrás',
      isRead: true,
      priority: 'medium',
    },
  ]);

  const [emailSettings, setEmailSettings] = useState({
    quizCompleted: true,
    newMissions: true,
    announcements: true,
    rewards: true,
    housePoints: true,
    dailyDigest: false,
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markAsRead = (id: string) => {
    setNotifications(
      notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
    );
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, isRead: true })));
  };

  const removeNotification = (id: string) => {
    setNotifications(notifications.filter((n) => n.id !== id));
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'quiz_completed':
        return '🧪';
      case 'new_mission':
        return '⚡';
      case 'announcement':
        return '📢';
      case 'reward':
        return '🏆';
      case 'house_points':
        return '🏠';
      default:
        return '📧';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'low':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className='space-y-6'>
      {/* Notification Center */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <Bell className='w-5 h-5' />
              Central de Notificações
              {unreadCount > 0 && (
                <Badge className='bg-red-500 text-white'>{unreadCount}</Badge>
              )}
            </div>
            {unreadCount > 0 && (
              <Button variant='outline' size='sm' onClick={markAllAsRead}>
                <Check className='w-4 h-4 mr-2' />
                Marcar todas como lidas
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='space-y-3'>
            {notifications.length === 0 ? (
              <div className='text-center py-8 text-muted-foreground'>
                <Mail className='w-12 h-12 mx-auto mb-4 opacity-50' />
                <p>Nenhuma notificação no momento</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 rounded-lg border transition-colors ${
                    notification.isRead
                      ? 'bg-muted/30 border-muted'
                      : 'bg-card border-primary/20 shadow-sm'
                  }`}
                >
                  <div className='flex items-start gap-3'>
                    <div className='text-2xl'>
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className='flex-1'>
                      <div className='flex items-center gap-2 mb-1'>
                        <h4
                          className={`font-semibold ${!notification.isRead ? 'text-primary' : ''}`}
                        >
                          {notification.title}
                        </h4>
                        <div
                          className={`w-2 h-2 rounded-full ${getPriorityColor(notification.priority)}`}
                        />
                        {!notification.isRead && (
                          <Badge variant='secondary' className='text-xs'>
                            Novo
                          </Badge>
                        )}
                      </div>
                      <p className='text-sm text-muted-foreground mb-2'>
                        {notification.message}
                      </p>
                      <div className='flex items-center justify-between'>
                        <span className='text-xs text-muted-foreground'>
                          {notification.timestamp}
                        </span>
                        <div className='flex gap-2'>
                          {!notification.isRead && (
                            <Button
                              variant='ghost'
                              size='sm'
                              onClick={() => markAsRead(notification.id)}
                            >
                              <Check className='w-3 h-3' />
                            </Button>
                          )}
                          <Button
                            variant='ghost'
                            size='sm'
                            onClick={() => removeNotification(notification.id)}
                          >
                            <X className='w-3 h-3' />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Email Settings */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Mail className='w-5 h-5' />
            Configurações de E-mail
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='space-y-4'>
            <div className='flex items-center justify-between'>
              <div>
                <h4 className='font-medium'>Quizzes Completados</h4>
                <p className='text-sm text-muted-foreground'>
                  Receba e-mails quando completar quizzes
                </p>
              </div>
              <Button
                variant={emailSettings.quizCompleted ? 'default' : 'outline'}
                size='sm'
                onClick={() =>
                  setEmailSettings({
                    ...emailSettings,
                    quizCompleted: !emailSettings.quizCompleted,
                  })
                }
              >
                {emailSettings.quizCompleted ? 'Ativo' : 'Inativo'}
              </Button>
            </div>

            <div className='flex items-center justify-between'>
              <div>
                <h4 className='font-medium'>Novas Missões</h4>
                <p className='text-sm text-muted-foreground'>
                  Seja notificado sobre novas missões
                </p>
              </div>
              <Button
                variant={emailSettings.newMissions ? 'default' : 'outline'}
                size='sm'
                onClick={() =>
                  setEmailSettings({
                    ...emailSettings,
                    newMissions: !emailSettings.newMissions,
                  })
                }
              >
                {emailSettings.newMissions ? 'Ativo' : 'Inativo'}
              </Button>
            </div>

            <div className='flex items-center justify-between'>
              <div>
                <h4 className='font-medium'>Anúncios Globais</h4>
                <p className='text-sm text-muted-foreground'>
                  Receba anúncios importantes dos mentores
                </p>
              </div>
              <Button
                variant={emailSettings.announcements ? 'default' : 'outline'}
                size='sm'
                onClick={() =>
                  setEmailSettings({
                    ...emailSettings,
                    announcements: !emailSettings.announcements,
                  })
                }
              >
                {emailSettings.announcements ? 'Ativo' : 'Inativo'}
              </Button>
            </div>

            <div className='flex items-center justify-between'>
              <div>
                <h4 className='font-medium'>Recompensas</h4>
                <p className='text-sm text-muted-foreground'>
                  Notificações sobre XP, galeões e badges
                </p>
              </div>
              <Button
                variant={emailSettings.rewards ? 'default' : 'outline'}
                size='sm'
                onClick={() =>
                  setEmailSettings({
                    ...emailSettings,
                    rewards: !emailSettings.rewards,
                  })
                }
              >
                {emailSettings.rewards ? 'Ativo' : 'Inativo'}
              </Button>
            </div>

            <div className='flex items-center justify-between'>
              <div>
                <h4 className='font-medium'>Resumo Diário</h4>
                <p className='text-sm text-muted-foreground'>
                  E-mail diário com seu progresso
                </p>
              </div>
              <Button
                variant={emailSettings.dailyDigest ? 'default' : 'outline'}
                size='sm'
                onClick={() =>
                  setEmailSettings({
                    ...emailSettings,
                    dailyDigest: !emailSettings.dailyDigest,
                  })
                }
              >
                {emailSettings.dailyDigest ? 'Ativo' : 'Inativo'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
