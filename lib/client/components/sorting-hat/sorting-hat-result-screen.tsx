import { Crown } from 'lucide-react';
import { LoadingScreen } from '@/lib/client/components/loading-screen';
import { Badge } from '@/lib/client/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/lib/client/components/ui/card';
import { MagicalParticles } from '@/lib/client/components/ui/magical-particles';
import { type HouseId, type House } from '@/lib/core/domain/house';

type SortingHatResultScreenProperties = {
  houseId: HouseId;
  house: House;
  isLoading: boolean;
  error: string;
};

export default function SortingHatResultScreen({
  houseId,
  house,
  isLoading,
  error,
}: SortingHatResultScreenProperties) {
  return (
    <div className='flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-accent/5 to-background p-4'>
      <MagicalParticles count={30} />
      <Card className='relative z-10 w-full max-w-2xl border-accent/20 shadow-2xl magical-border'>
        <CardHeader className='pb-8 text-center space-y-6'>
          <div
            className={`house-${houseId} mx-auto flex h-24 w-24 animate-pulse items-center justify-center rounded-full shadow-lg`}
          >
            <Crown className='h-12 w-12 text-white' />
          </div>
          <div>
            <CardTitle className={`text-4xl font-bold text-magical`}>
              {house.name}!
            </CardTitle>
            <CardDescription className='mt-2 text-xl'>
              {house.description}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className='text-center space-y-6'>
          <div className='animate-float text-7xl'>{house.icon}</div>
          <div className='flex flex-wrap justify-center gap-2'>
            {house.traits.map((trait) => (
              <Badge
                className='px-3 py-1 text-sm'
                key={trait}
                variant='secondary'
              >
                {trait}
              </Badge>
            ))}
          </div>
          <p className='text-muted-foreground'>
            Especialidade:{' '}
            <strong className='text-foreground'>{house.specialty}</strong>
          </p>

          {isLoading && (
            <LoadingScreen message='Preparando sua entrada em Hogwarts...' />
          )}

          {error && <p className='pt-4 text-sm text-destructive'>{error}</p>}
        </CardContent>
      </Card>
    </div>
  );
}
