'use client';
import { Card, CardContent } from '@/lib/client/components/ui/card';
import { Badge } from '@/lib/client/components/ui/badge';

interface House {
  id: string;
  name: string;
  description: string;
  specialty: string;
  colors: string;
  traits: string[];
  icon: string;
  quote: string;
}

interface HouseSelectorProps {
  onHouseSelect: (houseId: string) => void;
  selectedHouse?: string;
}

export function HouseSelector({
  onHouseSelect,
  selectedHouse,
}: HouseSelectorProps) {
  const houses: House[] = [
    {
      id: 'gryffindor',
      name: 'Grifinória',
      description: 'Casa dos corajosos desenvolvedores Frontend',
      specialty: 'Frontend Development',
      colors: 'from-red-600 to-yellow-500',
      traits: ['Corajoso', 'Inovador', 'Líder'],
      icon: '🦁',
      quote:
        'A coragem não é a ausência do medo, mas a capacidade de criar interfaces incríveis!',
    },
    {
      id: 'slytherin',
      name: 'Sonserina',
      description: 'Casa dos ambiciosos arquitetos Backend',
      specialty: 'Backend Development',
      colors: 'from-green-600 to-gray-500',
      traits: ['Ambicioso', 'Estratégico', 'Eficiente'],
      icon: '🐍',
      quote:
        'A ambição é a chave para construir sistemas que dominam o mundo digital!',
    },
    {
      id: 'ravenclaw',
      name: 'Corvinal',
      description: 'Casa dos sábios cientistas de dados',
      specialty: 'Data Science & AI',
      colors: 'from-blue-600 to-purple-500',
      traits: ['Inteligente', 'Analítico', 'Curioso'],
      icon: '🦅',
      quote:
        'O conhecimento é poder, e os dados são a fonte de toda sabedoria!',
    },
    {
      id: 'hufflepuff',
      name: 'Lufa-Lufa',
      description: 'Casa dos leais especialistas DevOps',
      specialty: 'DevOps & Infrastructure',
      colors: 'from-yellow-500 to-black',
      traits: ['Leal', 'Confiável', 'Trabalhador'],
      icon: '🦡',
      quote: 'O trabalho duro e a dedicação mantêm toda a magia funcionando!',
    },
  ];

  return (
    <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
      {houses.map((house) => (
        <Card
          key={house.id}
          className={`cursor-pointer transition-all hover:scale-105 ${
            selectedHouse === house.id
              ? 'ring-2 ring-accent magical-border'
              : ''
          }`}
          onClick={() => onHouseSelect(house.id)}
        >
          <CardContent className='p-6 text-center'>
            <div
              className={`w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br ${house.colors} flex items-center justify-center animate-float`}
            >
              <span className='text-4xl'>{house.icon}</span>
            </div>

            <h3 className='text-xl font-bold mb-2'>{house.name}</h3>
            <p className='text-sm text-muted-foreground mb-3'>
              {house.description}
            </p>

            <div className='flex justify-center gap-1 mb-3'>
              {house.traits.map((trait, index) => (
                <Badge key={index} variant='secondary' className='text-xs'>
                  {trait}
                </Badge>
              ))}
            </div>

            <p className='text-xs italic text-muted-foreground mb-4'>
              "{house.quote}"
            </p>

            <div className='text-xs font-semibold text-accent'>
              {house.specialty}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
