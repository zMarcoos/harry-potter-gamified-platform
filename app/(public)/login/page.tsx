'use client';

import { BookOpen, Lock, Mail, Sparkles, User, Wand2, Zap } from 'lucide-react';
import { Button } from '@/lib/client/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/lib/client/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/lib/client/components/ui/tabs';
import { MagicalParticles } from '@/lib/client/components/ui/magical-particles';
import { LoadingScreen } from '@/lib/client/components/loading-screen';
import FormularyInput from '@/lib/client/components/formulary/formulary-input';
import FormularyPasswordInput from '@/lib/client/components/formulary/formulary-password-input';
import FormularySpinner from '@/lib/client/components/formulary/formulary-spinner';

import { useRouter } from 'next/navigation';
import {
  useEffect,
  useState,
  type ChangeEvent,
  type FormEvent,
  type FocusEvent,
} from 'react';
import { useMutation } from '@tanstack/react-query';
import {
  useAuthActions,
  useAuthState,
} from '@/lib/client/contexts/auth-context';
import { useRegistrationStore } from '@/lib/client/store/registration-store';
import { validate } from '@/lib/core/utils/type-validator';
import { initialRegisterSchema, loginSchema } from '@/lib/core/types/auth.type';
import { authService } from '@/lib/core/services/auth.service';

export default function LoginPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuthState();
  const { login, isPendingLogin } = useAuthActions();

  const router = useRouter();

  const { mutateAsync: checkEmail, isPending: isPendingCheckEmail } =
    useMutation({
      mutationFn: authService.checkEmail,
    });

  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});

  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
  });

  const [registerData, setRegisterData] = useState({
    name: '',
    email: '',
    password: '',
  });

  const isFormLoading = isPendingLogin || isPendingCheckEmail;

  const handleLoginChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setLoginData((previous) => ({ ...previous, [name]: value }));
    setErrors((previousErrors) => ({
      ...previousErrors,
      [name]: undefined,
      form: undefined,
    }));
  };

  const handleLoginBlur = (event: FocusEvent<HTMLInputElement>) => {
    const { name } = event.target;
    const validationResult = validate(loginSchema, loginData);

    setErrors((previousErrors) => ({
      ...previousErrors,
      [name]: !validationResult.ok ? validationResult.errors[name] : undefined,
    }));
  };

  const handleRegisterChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setRegisterData((previous) => ({ ...previous, [name]: value }));
    setErrors((previousErrors) => ({
      ...previousErrors,
      [name]: undefined,
      form: undefined,
    }));
  };

  const handleRegisterBlur = (event: FocusEvent<HTMLInputElement>) => {
    const { name } = event.target;
    const validationResult = validate(initialRegisterSchema, registerData);

    setErrors((previousErrors) => ({
      ...previousErrors,
      [name]: !validationResult.ok ? validationResult.errors[name] : undefined,
    }));
  };

  useEffect(() => {
    if (!authLoading && isAuthenticated) router.push('/select-class');
  }, [authLoading, isAuthenticated, router]);

  const handleLogin = async (event: FormEvent) => {
    event.preventDefault();
    const validationResult = validate(loginSchema, loginData);
    if (!validationResult.ok) {
      setErrors(validationResult.errors);
      return;
    }

    setErrors((previous) => ({ ...previous, form: undefined }));

    try {
      await login(validationResult.data);
    } catch (error: any) {
      setErrors({ form: error.message || 'Ocorreu um erro ao fazer login.' });
    }
  };

  const handleStartRegister = async (event: FormEvent) => {
    event.preventDefault();
    const validationResult = validate(initialRegisterSchema, registerData);
    if (!validationResult.ok) {
      setErrors(validationResult.errors);
      return;
    }
    setErrors((previous) => ({ ...previous, form: undefined }));

    try {
      const response = await checkEmail(validationResult.data.email);
      if (response.exists) {
        setErrors({ email: 'Este e-mail já está em uso. Tente outro.' });
        return;
      }

      useRegistrationStore
        .getState()
        .setRegistrationData(validationResult.data);
      router.push('/sorting-hat');
    } catch (error: any) {
      setErrors({ form: error.message });
    }
  };

  if (authLoading)
    return <LoadingScreen message='Verificando sua identidade mágica...' />;
  if (isAuthenticated) return null;

  return (
    <div className='flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-accent/5 to-background p-4'>
      <MagicalParticles count={25} />
      <div className='relative z-10 w-full max-w-md'>
        <Card className='magical-border card-hover border-accent/20 shadow-2xl'>
          <CardHeader className='pb-6 text-center space-y-4'>
            <div className='button-hover animate-glow mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent shadow-lg'>
              <Zap className='h-8 w-8 text-white' />
            </div>
            <div>
              <CardTitle className='text-3xl font-bold text-chroma'>
                Escola de Magia
              </CardTitle>
              <CardDescription className='text-lg'>
                e Desenvolvimento Web
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent>
            {errors.form && (
              <div className='mb-4 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive'>
                {errors.form}
              </div>
            )}

            <Tabs
              className='space-y-4'
              onValueChange={(value) =>
                setActiveTab(value as 'login' | 'register')
              }
              value={activeTab}
            >
              <TabsList className='tabs-transition grid w-full grid-cols-2'>
                <TabsTrigger
                  className='tabs-transition flex items-center gap-2'
                  value='login'
                >
                  <BookOpen className='h-4 w-4' /> Entrar
                </TabsTrigger>
                <TabsTrigger
                  className='tabs-transition flex items-center gap-2'
                  value='register'
                >
                  <Wand2 className='h-4 w-4' /> Registrar
                </TabsTrigger>
              </TabsList>

              <TabsContent value='login'>
                <form className='space-y-4' onSubmit={handleLogin}>
                  <FormularyInput
                    id='login-email'
                    name='email'
                    label='Email'
                    icon={Mail}
                    type='email'
                    placeholder='seu.email@hogwarts.com'
                    value={loginData.email}
                    onChange={handleLoginChange}
                    onBlur={handleLoginBlur}
                    error={errors.email}
                    disabled={isFormLoading}
                  />

                  <FormularyPasswordInput
                    id='login-password'
                    name='password'
                    label='Senha'
                    icon={Lock}
                    placeholder='••••••••'
                    minLength={6}
                    value={loginData.password}
                    onChange={handleLoginChange}
                    onBlur={handleLoginBlur}
                    error={errors.password}
                    disabled={isFormLoading}
                    showPassword={showPassword}
                    onTogglePassword={() => setShowPassword(!showPassword)}
                  />

                  <Button
                    className='w-full'
                    disabled={isPendingLogin}
                    type='submit'
                  >
                    {isPendingLogin ? (
                      <>
                        <FormularySpinner />
                        Verificando...
                      </>
                    ) : (
                      <>
                        <Zap className='mr-2 h-4 w-4' /> Entrar em Hogwarts
                      </>
                    )}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value='register'>
                <form className='space-y-4' onSubmit={handleStartRegister}>
                  <FormularyInput
                    id='register-name'
                    name='name'
                    label='Nome Completo'
                    icon={User}
                    type='text'
                    placeholder='Harry Potter'
                    value={registerData.name}
                    onChange={handleRegisterChange}
                    onBlur={handleRegisterBlur}
                    error={errors.name}
                    disabled={isFormLoading}
                  />

                  <FormularyInput
                    id='register-email'
                    name='email'
                    label='Email'
                    icon={Mail}
                    type='email'
                    placeholder='seu.email@hogwarts.com'
                    value={registerData.email}
                    onChange={handleRegisterChange}
                    onBlur={handleRegisterBlur}
                    error={errors.email}
                    disabled={isFormLoading}
                  />

                  <FormularyPasswordInput
                    id='register-password'
                    name='password'
                    label='Senha'
                    icon={Lock}
                    placeholder='Mínimo de 6 caracteres'
                    minLength={6}
                    value={registerData.password}
                    onChange={handleRegisterChange}
                    onBlur={handleRegisterBlur}
                    error={errors.password}
                    disabled={isFormLoading}
                    showPassword={showPassword}
                    onTogglePassword={() => setShowPassword(!showPassword)}
                  />

                  <Button
                    className='w-full'
                    disabled={isPendingCheckEmail}
                    type='submit'
                  >
                    {isPendingCheckEmail ? (
                      <>
                        <FormularySpinner />
                        Aguarde...
                      </>
                    ) : (
                      <>
                        <Sparkles className='mr-2 h-4 w-4' /> Iniciar Cerimônia
                        Seletora
                      </>
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
