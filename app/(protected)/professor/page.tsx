'use client';

import {
    Award,
    BarChart3,
    BookOpen,
    Calendar,
    Clock,
    Crown,
    Edit,
    Eye,
    LogOut,
    Mail,
    Megaphone,
    MessageSquare,
    Plus,
    Star,
    Trophy,
    Users,
    Zap,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Avatar, AvatarFallback } from '@/lib/client/components/ui/avatar';
import { Badge } from '@/lib/client/components/ui/badge';
import { Button } from '@/lib/client/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/lib/client/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/lib/client/components/ui/dialog';
import { Input } from '@/lib/client/components/ui/input';
import { Label } from '@/lib/client/components/ui/label';
import { Progress } from '@/lib/client/components/ui/progress';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/lib/client/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/lib/client/components/ui/tabs';
import { Textarea } from '@/lib/client/components/ui/textarea';
import activitiesData from '@/data/content/activities.json';
import announcementsData from '@/data/content/announcements.json';
import housesData from '@/data/content/houses.json';
import quizzesData from '@/data/content/quizzes.json';
import usersData from '@/data/core/users.json';
import { useAuth } from '@/lib/client/contexts/auth-context';
import { getHouseColors } from '@/lib/types';

import type { User } from '@/lib/core/types/user.type';

export default function ProfessorDashboard() {
  const { user, logout, isAuthenticated } = useAuth();
  const router = useRouter();
  const [selectedStudent, setSelectedStudent] = useState<User | null>(null);
  const [newAnnouncement, setNewAnnouncement] = useState('');
  const [selectedHouse, setSelectedHouse] = useState<string>('all');
  const [announcementType, setAnnouncementType] = useState('info');
  const [announcementTarget, setAnnouncementTarget] = useState('all');

  const [newQuiz, setNewQuiz] = useState({
    description: '',
    difficulty: '',
    questions: [
      { correct: 0, explanation: '', options: ['', '', '', ''], question: '' },
    ],
    title: '',
  });

  const [newMission, setNewMission] = useState({
    description: '',
    difficulty: '',
    galleonReward: '',
    housePoints: '',
    title: '',
    xpReward: '',
  });

  const [reward, setReward] = useState({
    amount: '',
    reason: '',
    studentId: '',
    type: 'xp',
  });

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (user?.role !== 'professor') {
      router.push('/great-hall');
      return;
    }
  }, [isAuthenticated, user, router]);

  if (!user || user.role !== 'professor') {
    return (
      <div className='min-h-screen bg-gradient-to-br from-background via-card to-background flex items-center justify-center'>
        <div className='text-center'>
          <div className='w-16 h-16 mx-auto mb-4 border-4 border-accent border-t-transparent rounded-full animate-spin' />
          <p className='text-muted-foreground'>Verificando permissões...</p>
        </div>
      </div>
    );
  }

  const students = usersData.users.filter((u) => u.role === 'student');
  const houseStats = housesData.houses;
  const recentActivities = activitiesData.recentActivities.slice(0, 4);
  const submissions: any[] = []; 

  const mentorStats = {
    activeQuizzes: quizzesData.quizzes?.length || 12,
    completedMissions: students.reduce(
      (acc, s) => acc + (s.completedQuizzes?.length || 0),
      0,
    ),
    pendingReviews: submissions.filter((s) => s.status === 'pending').length,
    totalStudents: students.length,
  };

  const getStatusColor = (student: any) => {
    if (student.isOnline) return 'bg-green-500';
    if (student.streak < 3) return 'bg-red-500';
    if (student.xp < 1000) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getStatusText = (student: any) => {
    if (student.isOnline) return 'Ativo';
    if (student.streak < 3) return 'Inativo';
    if (student.xp < 1000) return 'Dificuldades';
    return 'Ativo';
  };

  const filteredStudents =
    selectedHouse === 'all'
      ? students
      : students.filter((student) => student.house === selectedHouse);

  const handleSendAnnouncement = () => {
    if (!newAnnouncement.trim()) return;

    const announcement = {
      createdAt: new Date().toISOString(),
      createdBy: user.id,
      id: Date.now(),
      isGlobal: announcementTarget === 'all',
      message: newAnnouncement,
      targetHouse: announcementTarget !== 'all' ? [announcementTarget] : null,
      title: 'Decreto Educacional',
      type: announcementType,
    };

    console.log('[v0] Sending announcement:', announcement);
    setNewAnnouncement('');
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const totalStudents = students.length;
  const activeStudents = students.filter((s) => s.isOnline).length;
  const averageScore = Math.round(
    students.reduce((acc, s) => {
      const scores = Object.values(s.quizScores || {}).map((q: any) => q.score);
      const avg =
        scores.length > 0
          ? scores.reduce((a, b) => a + b, 0) / scores.length
          : 0;
      return acc + avg;
    }, 0) / students.length,
  );
  const alertCount = students.filter(
    (s) => (s.streak || 0) < 3 || (s.xp || 0) < 500,
  ).length;

  return (
    <div className='min-h-screen bg-gradient-to-br from-background via-card to-background'>
      {/* Header */}
      <header className='border-b border-border bg-card/50 backdrop-blur-sm'>
        <div className='container mx-auto px-4 py-4'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-4'>
              <Button onClick={() => window.history.back()} variant='ghost'>
                ← Voltar
              </Button>
              <div className='flex items-center gap-3'>
                <div className='w-10 h-10 rounded-full bg-gradient-to-br from-accent to-primary flex items-center justify-center animate-glow'>
                  <Crown className='w-6 h-6 text-white' />
                </div>
                <div>
                  <h1 className='text-2xl font-bold text-magical'>
                    Sala de Dumbledore
                  </h1>
                  <p className='text-sm text-muted-foreground'>
                    Painel do Professor - {user.name}
                  </p>
                </div>
              </div>
            </div>
            <Button onClick={handleLogout} variant='ghost'>
              <LogOut className='w-4 h-4 mr-2' />
              Sair
            </Button>
          </div>
        </div>
      </header>

      <div className='container mx-auto px-4 py-8'>
        <Tabs className='space-y-6' defaultValue='overview'>
          <TabsList className='grid w-full grid-cols-8 bg-card'>
            <TabsTrigger value='overview'>Visão Geral</TabsTrigger>
            <TabsTrigger value='students'>Alunos</TabsTrigger>
            <TabsTrigger value='houses'>Casas</TabsTrigger>
            <TabsTrigger value='quizzes'>Quizzes</TabsTrigger>
            <TabsTrigger value='missions'>Missões</TabsTrigger>
            <TabsTrigger value='submissions'>Submissões</TabsTrigger>
            <TabsTrigger value='rewards'>Premiações</TabsTrigger>
            <TabsTrigger value='communication'>Comunicação</TabsTrigger>
          </TabsList>

          {/* Overview */}
          <TabsContent className='space-y-6' value='overview'>
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
              <Card className='mentor-glow'>
                <CardContent className='p-6'>
                  <div className='flex items-center justify-between'>
                    <div>
                      <p className='text-sm text-muted-foreground'>
                        Total de Alunos
                      </p>
                      <p className='text-3xl font-bold text-primary'>
                        {mentorStats.totalStudents}
                      </p>
                    </div>
                    <Users className='w-8 h-8 text-primary' />
                  </div>
                  <div className='mt-2 text-sm text-green-600'>
                    Estudantes registrados
                  </div>
                </CardContent>
              </Card>

              <Card className='mentor-glow'>
                <CardContent className='p-6'>
                  <div className='flex items-center justify-between'>
                    <div>
                      <p className='text-sm text-muted-foreground'>
                        Quizzes Ativos
                      </p>
                      <p className='text-3xl font-bold text-secondary'>
                        {mentorStats.activeQuizzes}
                      </p>
                    </div>
                    <BookOpen className='w-8 h-8 text-secondary' />
                  </div>
                  <div className='mt-2 text-sm text-green-600'>
                    Atividades disponíveis
                  </div>
                </CardContent>
              </Card>

              <Card className='mentor-glow'>
                <CardContent className='p-6'>
                  <div className='flex items-center justify-between'>
                    <div>
                      <p className='text-sm text-muted-foreground'>
                        Missões Concluídas
                      </p>
                      <p className='text-3xl font-bold text-accent'>
                        {mentorStats.completedMissions}
                      </p>
                    </div>
                    <Zap className='w-8 h-8 text-accent' />
                  </div>
                  <div className='mt-2 text-sm text-green-600'>
                    Total de conclusões
                  </div>
                </CardContent>
              </Card>

              <Card className='mentor-glow'>
                <CardContent className='p-6'>
                  <div className='flex items-center justify-between'>
                    <div>
                      <p className='text-sm text-muted-foreground'>
                        Revisões Pendentes
                      </p>
                      <p className='text-3xl font-bold text-destructive'>
                        {mentorStats.pendingReviews}
                      </p>
                    </div>
                    <Star className='w-8 h-8 text-destructive' />
                  </div>
                  <div className='mt-2 text-sm text-red-600'>
                    Aguardando avaliação
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <Clock className='w-5 h-5 text-primary' />
                  Atividade Recente dos Estudantes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  {recentActivities.map((activity, index) => (
                    <div
                      className='flex items-center justify-between p-3 rounded-lg bg-muted/30'
                      key={index}
                    >
                      <div className='flex items-center gap-3'>
                        <div className='w-2 h-2 rounded-full bg-green-500' />
                        <span className='font-medium'>{activity.user}</span>
                        <span className='text-muted-foreground'>
                          {activity.action}
                        </span>
                        {activity.xp && (
                          <Badge variant='secondary'>+{activity.xp} XP</Badge>
                        )}
                      </div>
                      <span className='text-sm text-muted-foreground'>
                        {new Date(activity.timestamp).toLocaleTimeString(
                          'pt-BR',
                          {
                            hour: '2-digit',
                            minute: '2-digit',
                          },
                        )}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* House Performance Chart */}
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <BarChart3 className='w-5 h-5 text-accent' />
                  Performance das Casas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  {houseStats.map((house) => (
                    <div className='space-y-2' key={house.name}>
                      <div className='flex items-center justify-between'>
                        <div className='flex items-center gap-2'>
                          <span className='text-xl'>{house.icon}</span>
                          <span className='font-semibold'>{house.name}</span>
                        </div>
                        <span className='text-sm text-muted-foreground'>
                          {house.points} pontos
                        </span>
                      </div>
                      <Progress
                        className='h-2'
                        value={
                          (house.points /
                            Math.max(...houseStats.map((h) => h.points))) *
                          100
                        }
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Students */}
          <TabsContent className='space-y-6' value='students'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-4'>
                <Select onValueChange={setSelectedHouse} value={selectedHouse}>
                  <SelectTrigger className='w-48'>
                    <SelectValue placeholder='Filtrar por casa' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='all'>Todas as Casas</SelectItem>
                    <SelectItem value='gryffindor'>Grifinória</SelectItem>
                    <SelectItem value='slytherin'>Sonserina</SelectItem>
                    <SelectItem value='ravenclaw'>Corvinal</SelectItem>
                    <SelectItem value='hufflepuff'>Lufa-Lufa</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
              {filteredStudents.map((student) => (
                <Card
                  className='hover:shadow-lg transition-shadow cursor-pointer'
                  key={student.id}
                >
                  <CardContent className='p-4'>
                    <div className='flex items-center gap-3 mb-4'>
                      <div className='relative'>
                        <Avatar className='w-12 h-12'>
                          <AvatarFallback
                            className={`bg-gradient-to-br ${getHouseColors(student.house)} text-white`}
                          >
                            {student.name
                              .split(' ')
                              .map((n) => n[0])
                              .join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div
                          className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full ${getStatusColor(student)} border-2 border-background`}
                        />
                      </div>
                      <div className='flex-1'>
                        <h3 className='font-semibold'>{student.name}</h3>
                        <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                          <Badge className='text-xs' variant='outline'>
                            {student.year}º Ano
                          </Badge>
                          <Badge
                            className='text-xs capitalize'
                            variant='outline'
                          >
                            {student.house}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <div className='space-y-3'>
                      <div className='flex justify-between text-sm'>
                        <span>XP Total</span>
                        <span className='font-semibold'>{student.xp}</span>
                      </div>
                      <div className='flex justify-between text-sm'>
                        <span>Quizzes</span>
                        <span className='font-semibold'>
                          {student.completedQuizzes?.length || 0}
                        </span>
                      </div>
                      <div className='flex justify-between text-sm'>
                        <span>Streak</span>
                        <span className='font-semibold'>
                          {student.streak} dias
                        </span>
                      </div>
                      <div className='flex justify-between text-sm'>
                        <span>Status</span>
                        <Badge className={getStatusColor(student)}>
                          {getStatusText(student)}
                        </Badge>
                      </div>
                    </div>

                    <div className='flex gap-2 mt-4'>
                      <Button
                        className='flex-1 bg-transparent'
                        size='sm'
                        variant='outline'
                      >
                        <Eye className='w-4 h-4 mr-1' />
                        Ver Perfil
                      </Button>
                      <Button
                        className='flex-1 bg-transparent'
                        size='sm'
                        variant='outline'
                      >
                        <MessageSquare className='w-4 h-4 mr-1' />
                        Mensagem
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Houses */}
          <TabsContent className='space-y-6' value='houses'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              {houseStats.map((house, index) => (
                <Card
                  className={`relative overflow-hidden ${index === 2 ? 'ring-2 ring-accent' : ''}`}
                  key={house.name}
                >
                  <CardHeader>
                    <div className='flex items-center justify-between'>
                      <div className='flex items-center gap-3'>
                        <span className='text-3xl'>{house.icon}</span>
                        <div>
                          <CardTitle>{house.name}</CardTitle>
                          <CardDescription>
                            {house.members} membros
                          </CardDescription>
                        </div>
                      </div>
                      {index === 2 && <Crown className='w-6 h-6 text-accent' />}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className='grid grid-cols-2 gap-4'>
                      <div className='text-center'>
                        <div className='text-2xl font-bold text-primary'>
                          {house.points}
                        </div>
                        <div className='text-sm text-muted-foreground'>
                          Pontos
                        </div>
                      </div>
                      <div className='text-center'>
                        <div className='text-2xl font-bold text-secondary'>
                          {house.members}
                        </div>
                        <div className='text-sm text-muted-foreground'>
                          Membros
                        </div>
                      </div>
                      <div className='text-center'>
                        <div className='text-2xl font-bold text-accent'>
                          {house.specialty}
                        </div>
                        <div className='text-sm text-muted-foreground'>
                          Especialidade
                        </div>
                      </div>
                      <div className='text-center'>
                        <div className='text-2xl font-bold text-primary'>
                          {
                            students.filter(
                              (s) => s.house === house.id && s.isOnline,
                            ).length
                          }
                        </div>
                        <div className='text-sm text-muted-foreground'>
                          Online
                        </div>
                      </div>
                    </div>

                    <div className='mt-4'>
                      <Button
                        className='w-full bg-transparent'
                        variant='outline'
                      >
                        <Award className='w-4 h-4 mr-2' />
                        Dar Pontos Extras
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent className='space-y-6' value='quizzes'>
            <div className='flex justify-between items-center'>
              <h2 className='text-2xl font-bold'>Gerenciar Quizzes</h2>
              <Dialog>
                <DialogTrigger asChild>
                  <Button className='shimmer'>
                    <Plus className='h-4 w-4 mr-2' />
                    Novo Quiz
                  </Button>
                </DialogTrigger>
                <DialogContent className='max-w-2xl'>
                  <DialogHeader>
                    <DialogTitle>Criar Novo Quiz</DialogTitle>
                    <DialogDescription>
                      Adicione um novo quiz para os estudantes praticarem
                    </DialogDescription>
                  </DialogHeader>
                  <div className='space-y-4'>
                    <div>
                      <Label htmlFor='quiz-title'>Título do Quiz</Label>
                      <Input
                        id='quiz-title'
                        onChange={(e) =>
                          setNewQuiz({ ...newQuiz, title: e.target.value })
                        }
                        placeholder='Ex: Fundamentos de JavaScript'
                        value={newQuiz.title}
                      />
                    </div>
                    <div>
                      <Label htmlFor='quiz-description'>Descrição</Label>
                      <Textarea
                        id='quiz-description'
                        onChange={(e) =>
                          setNewQuiz({
                            ...newQuiz,
                            description: e.target.value,
                          })
                        }
                        placeholder='Descreva o que será testado neste quiz...'
                        value={newQuiz.description}
                      />
                    </div>
                    <div>
                      <Label htmlFor='quiz-difficulty'>Dificuldade</Label>
                      <Select
                        onValueChange={(value) =>
                          setNewQuiz({ ...newQuiz, difficulty: value })
                        }
                        value={newQuiz.difficulty}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder='Selecione a dificuldade' />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value='beginner'>Iniciante</SelectItem>
                          <SelectItem value='intermediate'>
                            Intermediário
                          </SelectItem>
                          <SelectItem value='advanced'>Avançado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button className='w-full'>Criar Quiz</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </TabsContent>

          <TabsContent className='space-y-6' value='missions'>
            <div className='flex justify-between items-center'>
              <h2 className='text-2xl font-bold'>Gerenciar Missões</h2>
              <Dialog>
                <DialogTrigger asChild>
                  <Button className='shimmer'>
                    <Plus className='h-4 w-4 mr-2' />
                    Nova Missão
                  </Button>
                </DialogTrigger>
                <DialogContent className='max-w-2xl'>
                  <DialogHeader>
                    <DialogTitle>Criar Nova Missão</DialogTitle>
                    <DialogDescription>
                      Adicione uma nova missão para os estudantes completarem
                    </DialogDescription>
                  </DialogHeader>
                  <div className='space-y-4'>
                    <div>
                      <Label htmlFor='mission-title'>Título da Missão</Label>
                      <Input
                        id='mission-title'
                        onChange={(e) =>
                          setNewMission({
                            ...newMission,
                            title: e.target.value,
                          })
                        }
                        placeholder='Ex: Criar um Componente React'
                        value={newMission.title}
                      />
                    </div>
                    <div>
                      <Label htmlFor='mission-description'>Descrição</Label>
                      <Textarea
                        id='mission-description'
                        onChange={(e) =>
                          setNewMission({
                            ...newMission,
                            description: e.target.value,
                          })
                        }
                        placeholder='Descreva o que o estudante deve fazer...'
                        value={newMission.description}
                      />
                    </div>
                    <div className='grid grid-cols-3 gap-4'>
                      <div>
                        <Label htmlFor='xp-reward'>XP Recompensa</Label>
                        <Input
                          id='xp-reward'
                          onChange={(e) =>
                            setNewMission({
                              ...newMission,
                              xpReward: e.target.value,
                            })
                          }
                          placeholder='100'
                          type='number'
                          value={newMission.xpReward}
                        />
                      </div>
                      <div>
                        <Label htmlFor='galleon-reward'>Galeões</Label>
                        <Input
                          id='galleon-reward'
                          onChange={(e) =>
                            setNewMission({
                              ...newMission,
                              galleonReward: e.target.value,
                            })
                          }
                          placeholder='50'
                          type='number'
                          value={newMission.galleonReward}
                        />
                      </div>
                      <div>
                        <Label htmlFor='house-points'>Pontos da Casa</Label>
                        <Input
                          id='house-points'
                          onChange={(e) =>
                            setNewMission({
                              ...newMission,
                              housePoints: e.target.value,
                            })
                          }
                          placeholder='10'
                          type='number'
                          value={newMission.housePoints}
                        />
                      </div>
                    </div>
                    <Button className='w-full'>Criar Missão</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </TabsContent>

          <TabsContent className='space-y-6' value='submissions'>
            <div className='flex items-center justify-between'>
              <h2 className='text-2xl font-bold'>Submissões dos Alunos</h2>
              <Badge variant='outline'>{submissions.length} submissões</Badge>
            </div>

            <div className='space-y-4'>
              {submissions.map((submission: any) => (
                <Card
                  className='hover:shadow-lg transition-shadow'
                  key={submission.id}
                >
                  <CardContent className='p-6'>
                    <div className='flex items-center justify-between mb-4'>
                      <div className='flex items-center gap-3'>
                        <Avatar className='w-10 h-10'>
                          <AvatarFallback className='bg-gradient-to-br from-primary to-accent text-white'>
                            {submission.studentName
                              ?.split(' ')
                              .map((n: string) => n[0])
                              .join('') || '?'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className='font-semibold'>
                            {submission.studentName}
                          </h3>
                          <p className='text-sm text-muted-foreground'>
                            {submission.activityTitle}
                          </p>
                        </div>
                      </div>
                      <div className='flex items-center gap-2'>
                        <Badge
                          variant={
                            submission.status === 'graded'
                              ? 'default'
                              : submission.status === 'under_review'
                                ? 'secondary'
                                : 'outline'
                          }
                        >
                          {submission.status === 'graded'
                            ? 'Avaliado'
                            : submission.status === 'under_review'
                              ? 'Em Revisão'
                              : 'Pendente'}
                        </Badge>
                        {submission.grade && (
                          <Badge className='bg-green-500'>
                            {submission.grade}%
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className='space-y-2 mb-4'>
                      <div className='flex justify-between text-sm'>
                        <span>Tipo:</span>
                        <span className='capitalize'>
                          {submission.submissionType}
                        </span>
                      </div>
                      <div className='flex justify-between text-sm'>
                        <span>Submetido em:</span>
                        <span>
                          {new Date(submission.submittedAt).toLocaleDateString(
                            'pt-BR',
                          )}
                        </span>
                      </div>
                      {submission.submissionType === 'link' && (
                        <div className='flex justify-between text-sm'>
                          <span>Link:</span>
                          <a
                            className='text-primary hover:underline'
                            href={submission.submissionContent}
                            rel='noopener noreferrer'
                            target='_blank'
                          >
                            Ver projeto
                          </a>
                        </div>
                      )}
                    </div>

                    {submission.feedback && (
                      <div className='p-3 bg-muted/50 rounded-lg mb-4'>
                        <p className='text-sm'>{submission.feedback}</p>
                      </div>
                    )}

                    <div className='flex gap-2'>
                      <Button
                        className='flex-1 bg-transparent'
                        size='sm'
                        variant='outline'
                      >
                        <Eye className='w-4 h-4 mr-1' />
                        Revisar
                      </Button>
                      {submission.status === 'pending' && (
                        <Button className='flex-1' size='sm'>
                          <Edit className='w-4 h-4 mr-1' />
                          Avaliar
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent className='space-y-6' value='rewards'>
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <Trophy className='h-5 w-5' />
                  Premiar Estudante
                </CardTitle>
                <CardDescription>
                  Recompense estudantes por conquistas especiais
                </CardDescription>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div>
                  <Label htmlFor='student-select'>Selecionar Estudante</Label>
                  <Select
                    onValueChange={(value) =>
                      setReward({ ...reward, studentId: value })
                    }
                    value={reward.studentId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder='Escolha um estudante' />
                    </SelectTrigger>
                    <SelectContent>
                      {students.map((student) => (
                        <SelectItem key={student.id} value={student.id}>
                          {student.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <Label htmlFor='reward-type'>Tipo de Recompensa</Label>
                    <Select
                      onValueChange={(value) =>
                        setReward({ ...reward, type: value })
                      }
                      value={reward.type}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='xp'>XP</SelectItem>
                        <SelectItem value='galleons'>Galeões</SelectItem>
                        <SelectItem value='house-points'>
                          Pontos da Casa
                        </SelectItem>
                        <SelectItem value='badge'>Badge Especial</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor='reward-amount'>Quantidade</Label>
                    <Input
                      id='reward-amount'
                      onChange={(e) =>
                        setReward({ ...reward, amount: e.target.value })
                      }
                      placeholder='100'
                      type='number'
                      value={reward.amount}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor='reward-reason'>Motivo da Recompensa</Label>
                  <Textarea
                    id='reward-reason'
                    onChange={(e) =>
                      setReward({ ...reward, reason: e.target.value })
                    }
                    placeholder='Ex: Excelente desempenho no projeto final'
                    value={reward.reason}
                  />
                </div>
                <Button className='w-full'>
                  <Trophy className='h-4 w-4 mr-2' />
                  Conceder Recompensa
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Communication */}
          <TabsContent className='space-y-6' value='communication'>
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <Megaphone className='w-5 text-primary' />
                  Enviar Decreto Educacional
                </CardTitle>
                <CardDescription>
                  Comunique-se com todos os alunos ou casas específicas
                </CardDescription>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div>
                    <Label className='text-sm font-medium mb-2 block'>
                      Destinatário
                    </Label>
                    <Select
                      onValueChange={setAnnouncementTarget}
                      value={announcementTarget}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder='Selecionar destinatário' />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='all'>Todos os Alunos</SelectItem>
                        <SelectItem value='gryffindor'>Grifinória</SelectItem>
                        <SelectItem value='slytherin'>Sonserina</SelectItem>
                        <SelectItem value='ravenclaw'>Corvinal</SelectItem>
                        <SelectItem value='hufflepuff'>Lufa-Lufa</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className='text-sm font-medium mb-2 block'>
                      Tipo
                    </Label>
                    <Select
                      onValueChange={setAnnouncementType}
                      value={announcementType}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder='Tipo de mensagem' />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='info'>Anúncio</SelectItem>
                        <SelectItem value='warning'>
                          Howler (Urgente)
                        </SelectItem>
                        <SelectItem value='success'>Encorajamento</SelectItem>
                        <SelectItem value='event'>Lembrete</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label className='text-sm font-medium mb-2 block'>
                    Mensagem
                  </Label>
                  <Textarea
                    className='min-h-[120px]'
                    onChange={(e) => setNewAnnouncement(e.target.value)}
                    placeholder='Digite sua mensagem aqui...'
                    value={newAnnouncement}
                  />
                </div>
                <Button
                  className='w-full announcement-pulse'
                  onClick={handleSendAnnouncement}
                >
                  <Megaphone className='w-4 h-4 mr-2' />
                  Enviar Decreto Global
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <Mail className='h-5 w-5' />
                  Sistema de E-mails
                </CardTitle>
                <CardDescription>
                  Gerencie notificações por e-mail para estudantes
                </CardDescription>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='grid grid-cols-2 gap-4'>
                  <Card>
                    <CardHeader>
                      <CardTitle className='text-lg'>
                        E-mails Automáticos
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className='space-y-2'>
                        <div className='flex items-center justify-between'>
                          <span>Novos quizzes</span>
                          <Badge variant='outline'>Ativo</Badge>
                        </div>
                        <div className='flex items-center justify-between'>
                          <span>Missões completadas</span>
                          <Badge variant='outline'>Ativo</Badge>
                        </div>
                        <div className='flex items-center justify-between'>
                          <span>Anúncios globais</span>
                          <Badge variant='outline'>Ativo</Badge>
                        </div>
                        <div className='flex items-center justify-between'>
                          <span>Recompensas recebidas</span>
                          <Badge variant='outline'>Ativo</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className='text-lg'>Estatísticas</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className='space-y-2'>
                        <div className='flex justify-between'>
                          <span>E-mails enviados hoje:</span>
                          <span className='font-bold'>23</span>
                        </div>
                        <div className='flex justify-between'>
                          <span>Taxa de abertura:</span>
                          <span className='font-bold'>87%</span>
                        </div>
                        <div className='flex justify-between'>
                          <span>Estudantes inscritos:</span>
                          <span className='font-bold'>{totalStudents}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Button className='w-full'>
                  <Mail className='h-4 w-4 mr-2' />
                  Configurar Notificações
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <Calendar className='w-5 h-5 text-secondary' />
                  Anúncios Recentes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  {announcementsData.announcements
                    .slice(0, 3)
                    .map((announcement) => (
                      <div
                        className='flex items-center justify-between p-3 rounded-lg bg-muted/30'
                        key={announcement.id}
                      >
                        <div>
                          <h4 className='font-semibold'>
                            {announcement.title}
                          </h4>
                          <p className='text-sm text-muted-foreground'>
                            {announcement.message}
                          </p>
                        </div>
                        <Badge
                          variant={
                            announcement.type === 'warning'
                              ? 'destructive'
                              : 'secondary'
                          }
                        >
                          {announcement.type}
                        </Badge>
                      </div>
                    ))}
                  <Button className='w-full bg-transparent' variant='outline'>
                    <Plus className='w-4 mr-2' />
                    Ver Todos os Anúncios
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
