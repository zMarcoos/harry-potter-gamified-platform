export type HouseId = 'gryffindor' | 'hufflepuff' | 'ravenclaw' | 'slytherin';

export interface House {
  id: HouseId;
  name: string;
  icon: string;
  founder: string;
  mascot: string;
  head: string;
  ghost: string;
  commonRoom: string;
  description: string;
  specialty: string;
  traits: string[];
  colors: string[];
  tailwindGradient: string;
}

export const housesData: Record<HouseId, Omit<House, 'id'>> = {
  gryffindor: {
    name: 'Grifinória',
    icon: '🦁',
    founder: 'Godric Gryffindor',
    mascot: 'Leão',
    head: 'Minerva McGonagall',
    ghost: 'Sir Nicholas de Mimsy-Porpington (Nick Quase Sem Cabeça)',
    commonRoom: 'Torre da Grifinória',
    description: 'Casa dos estudantes corajosos, audaciosos e criativos.',
    specialty: 'Frontend Development',
    traits: ['Coragem', 'Audácia', 'Determinação', 'Criatividade'],
    colors: ['#740001', '#D3A625'],
    tailwindGradient: 'from-red-600 to-yellow-500',
  },
  hufflepuff: {
    name: 'Lufa-Lufa',
    icon: '🦡',
    founder: 'Helga Hufflepuff',
    mascot: 'Texugo',
    head: 'Pomona Sprout',
    ghost: 'Frei Gorducho',
    commonRoom: 'Porão da Lufa-Lufa',
    description: 'Casa dos estudantes leais, trabalhadores e confiáveis.',
    specialty: 'DevOps & Infrastructure',
    traits: ['Lealdade', 'Paciência', 'Trabalho duro', 'Justiça'],
    colors: ['#FFDB00', '#000000'],
    tailwindGradient: 'from-yellow-500 to-gray-700',
  },
  ravenclaw: {
    name: 'Corvinal',
    icon: '🦅',
    founder: 'Rowena Ravenclaw',
    mascot: 'Águia',
    head: 'Filius Flitwick',
    ghost: 'Dama Cinzenta',
    commonRoom: 'Torre da Corvinal',
    description: 'Casa dos estudantes inteligentes, curiosos e analíticos.',
    specialty: 'Data Science',
    traits: ['Inteligência', 'Sabedoria', 'Criatividade', 'Aprendizado'],
    colors: ['#0E1A40', '#946B2D'],
    tailwindGradient: 'from-blue-600 to-gray-600',
  },
  slytherin: {
    name: 'Sonserina',
    icon: '🐍',
    founder: 'Salazar Slytherin',
    mascot: 'Serpente',
    head: 'Severus Snape',
    ghost: 'Barão Sangrento',
    commonRoom: 'Masmorras da Sonserina',
    description: 'Casa dos estudantes ambiciosos, estratégicos e eficientes.',
    specialty: 'Backend Development',
    traits: ['Ambição', 'Astúcia', 'Liderança', 'Determinação'],
    colors: ['#1A472A', '#AAAAAA'],
    tailwindGradient: 'from-green-600 to-gray-700',
  },
};
