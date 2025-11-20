import type { HouseId } from './house';

export interface SortingQuestionOption {
  text: string;
  icon: string;
  house: HouseId;
}

export interface SortingQuestion {
  question: string;
  options: SortingQuestionOption[];
}

export const sortingQuestions: SortingQuestion[] = [
  {
    options: [
      {
        house: 'gryffindor',
        icon: '🎨',
        text: 'Criar interfaces bonitas e interativas',
      },
      {
        house: 'slytherin',
        icon: '🧱',
        text: 'Construir sistemas robustos e escaláveis',
      },
      {
        house: 'ravenclaw',
        icon: '💡',
        text: 'Analisar dados e criar soluções inteligentes',
      },
      {
        house: 'hufflepuff',
        icon: '🔧',
        text: 'Garantir que tudo funcione perfeitamente',
      },
    ],
    question: 'Qual aspecto do desenvolvimento web mais te atrai?',
  },
  {
    options: [
      {
        house: 'gryffindor',
        icon: '👑',
        text: 'Lidero a equipe e tomo decisões corajosas',
      },
      {
        house: 'slytherin',
        icon: '🎯',
        text: 'Planejo estrategicamente cada movimento',
      },
      {
        house: 'ravenclaw',
        icon: '📜',
        text: 'Pesquiso profundamente antes de agir',
      },
      {
        house: 'hufflepuff',
        icon: '🤝',
        text: 'Colaboro e apoio todos os membros',
      },
    ],
    question: 'Como você prefere trabalhar em projetos?',
  },
  {
    options: [
      {
        house: 'gryffindor',
        icon: '✨',
        text: 'React, Vue.js - Frameworks Frontend',
      },
      {
        house: 'slytherin',
        icon: '🐍',
        text: 'Node.js, Python - Backend poderoso',
      },
      {
        house: 'ravenclaw',
        icon: '🧠',
        text: 'SQL, Machine Learning - Dados e IA',
      },
      {
        house: 'hufflepuff',
        icon: '🐳',
        text: 'Docker, CI/CD - DevOps e infraestrutura',
      },
    ],
    question: 'Qual linguagem/tecnologia te chama mais atenção?',
  },
  {
    options: [
      {
        house: 'gryffindor',
        icon: '🤯',
        text: 'Enfrenta de cabeça e testa várias soluções',
      },
      {
        house: 'slytherin',
        icon: '🔬',
        text: 'Analisa o código sistematicamente',
      },
      {
        house: 'ravenclaw',
        icon: '📖',
        text: 'Pesquisa documentação e Stack Overflow',
      },
      {
        house: 'hufflepuff',
        icon: '👥',
        text: 'Pede ajuda aos colegas e trabalha em equipe',
      },
    ],
    question: 'Quando encontra um bug difícil, você:',
  },
  {
    options: [
      {
        house: 'gryffindor',
        icon: '🚀',
        text: 'Uma aplicação web inovadora e viral',
      },
      {
        house: 'slytherin',
        icon: '🌊',
        text: 'Um sistema que processa milhões de dados',
      },
      {
        house: 'ravenclaw',
        icon: '🤖',
        text: 'Uma plataforma de análise inteligente',
      },
      {
        house: 'hufflepuff',
        icon: '🧰',
        text: 'Uma ferramenta que ajuda desenvolvedores',
      },
    ],
    question: 'Seu projeto dos sonhos seria:',
  },
];

export const calculateWinningHouse = (answers: HouseId[]): HouseId => {
  const houseScores: Record<string, number> = {
    gryffindor: 0,
    hufflepuff: 0,
    ravenclaw: 0,
    slytherin: 0,
  };

  answers.forEach((answer) => {
    houseScores[answer]++;
  });

  const [winningHouse] = Object.entries(houseScores).sort(
    ([, a], [, b]) => b - a,
  );

  return winningHouse[0] as HouseId;
};
