import { Crown } from 'lucide-react';
import { Button } from '@/lib/client/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/lib/client/components/ui/card';
import { MagicalParticles } from '@/lib/client/components/ui/magical-particles';
import { Progress } from '@/lib/client/components/ui/progress';
import { type HouseId } from '@/lib/core/domain/house';
import { type SortingQuestion } from '@/lib/core/domain/sorting-hat';

type SortingHatQuestionScreenProperties = {
  step: number;
  totalSteps: number;
  question: SortingQuestion;
  userName: string;
  onAnswer: (house: HouseId) => void;
};

export default function SortingHatQuestionScreen({
  step,
  totalSteps,
  question,
  userName,
  onAnswer,
}: SortingHatQuestionScreenProperties) {
  return (
    <div className='flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-accent/5 to-background p-4'>
      <MagicalParticles count={20} />
      <Card className='relative z-10 w-full max-w-3xl border-accent/20 shadow-2xl magical-border'>
        <CardHeader className='pb-6 text-center space-y-4'>
          <div className='animate-glow mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent shadow-lg'>
            <Crown className='h-10 w-10 animate-pulse text-white' />
          </div>
          <div>
            <CardTitle className='text-3xl font-bold text-magical'>
              Cerimônia do Chapéu Seletor
            </CardTitle>
            <CardDescription className='text-lg'>
              Descubra sua casa em Hogwarts, {userName}
            </CardDescription>
          </div>
          <div className='mx-auto w-full max-w-md'>
            <Progress className='h-2' value={((step + 1) / totalSteps) * 100} />
            <p className='mt-2 text-xs text-muted-foreground'>
              Pergunta {step + 1} de {totalSteps}
            </p>
          </div>
        </CardHeader>
        <CardContent className='px-6 pb-8'>
          <h3 className='mb-8 text-center text-xl font-semibold'>
            {question.question}
          </h3>
          <div className='mx-auto grid max-w-2xl grid-cols-1 gap-3 md:grid-cols-2'>
            {question.options.map((option) => (
              <Button
                className='group h-auto whitespace-normal p-4 justify-start text-left transition-all hover:border-accent hover:bg-accent/10 magical-border button-hover'
                key={option.house}
                onClick={() => onAnswer(option.house)}
                variant='outline'
              >
                <div className='flex w-full items-start gap-3'>
                  <span className='flex-shrink-0 text-2xl transition-transform group-hover:scale-110'>
                    {option.icon}
                  </span>
                  <span className='leading-relaxed text-foreground group-hover:text-foreground text-sm'>
                    {option.text}
                  </span>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
