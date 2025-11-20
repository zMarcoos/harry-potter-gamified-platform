export type ShopCurrency = 'galleons' | 'sickles' | 'knuts';
export type ShopCategory = 'wands' | 'robes' | 'books' | 'potions' | 'accessories';
export type ShopRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

export interface ShopItem {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: ShopCurrency;
  category: ShopCategory;
  rarity: ShopRarity;
  icon: string;
  effects: string[];
}

export const shopItemsData: ShopItem[] = [
  {
    id: '1',
    name: 'Varinha de Carvalho Premium',
    description:
      'Uma varinha elegante que melhora a visualização do seu código',
    price: 15,
    currency: 'galleons',
    category: 'wands',
    rarity: 'epic',
    icon: '🪄',
    effects: [
      'Efeitos visuais especiais ao codar',
      'Syntax highlighting melhorado',
    ],
  },
  {
    id: '2',
    name: 'Vestes da Casa Personalizadas',
    description: 'Vestes exclusivas com o brasão da sua casa',
    price: 8,
    currency: 'galleons',
    category: 'robes',
    rarity: 'rare',
    icon: '👘',
    effects: ['Avatar personalizado', '+10% XP em atividades da casa'],
  },
  {
    id: '3',
    name: 'Coruja Expressa',
    description: 'Receba notificações prioritárias de feedback',
    price: 25,
    currency: 'sickles',
    category: 'accessories',
    rarity: 'uncommon',
    icon: '🦉',
    effects: ['Notificações prioritárias', 'Feedback mais rápido'],
  },
  {
    id: '4',
    name: 'Vira-Tempo',
    description: 'Refaça um quiz mantendo a melhor nota',
    price: 12,
    currency: 'galleons',
    category: 'accessories',
    rarity: 'legendary',
    icon: '⏳',
    effects: ['Refazer quiz sem perder progresso', 'Manter melhor pontuação'],
  },
  {
    id: '5',
    name: 'Mapa do Maroto Premium',
    description: 'Veja soluções de outros após resolver desafios',
    price: 45,
    currency: 'sickles',
    category: 'books',
    rarity: 'rare',
    icon: '🗺️',
    effects: [
      'Ver soluções após completar',
      'Comparar diferentes abordagens',
    ],
  },
  {
    id: '6',
    name: 'Penseira Digital',
    description: 'Salve e organize seus snippets de código favoritos',
    price: 6,
    currency: 'galleons',
    category: 'accessories',
    rarity: 'common',
    icon: '🧠',
    effects: ['Biblioteca pessoal de snippets', 'Organização por tags'],
  },
  {
    id: '7',
    name: 'Felix Felicis',
    description: 'XP dobrado por 1 hora',
    price: 20,
    currency: 'galleons',
    category: 'potions',
    rarity: 'epic',
    icon: '🍯',
    effects: ['XP x2 por 1 hora', 'Efeito visual dourado'],
  },
  {
    id: '8',
    name: 'Livro de Feitiços Avançados',
    description: 'Acesso a tutoriais exclusivos e avançados',
    price: 35,
    currency: 'galleons',
    category: 'books',
    rarity: 'legendary',
    icon: '📚',
    effects: [
      'Tutoriais exclusivos',
      'Conteúdo avançado',
      'Certificados especiais',
    ],
  },
];

export const getShopRarityColor = (rarity: ShopRarity): string => {
  switch (rarity) {
    case 'common': return 'bg-gray-500';
    case 'uncommon': return 'bg-green-500';
    case 'rare': return 'bg-blue-500';
    case 'epic': return 'bg-purple-500';
    case 'legendary': return 'bg-yellow-500';
    default: return 'bg-gray-500';
  }
};

export const getShopRarityText = (rarity: ShopRarity): string => {
  switch (rarity) {
    case 'common': return 'Comum';
    case 'uncommon': return 'Incomum';
    case 'rare': return 'Raro';
    case 'epic': return 'Épico';
    case 'legendary': return 'Lendário';
    default: return 'Comum';
  }
};

export const getShopCurrencyIcon = (currency: ShopCurrency): string => {
  switch (currency) {
    case 'galleons': return '🥇';
    case 'sickles': return '🥈';
    case 'knuts': return '🥉';
    default: return '🪙';
  }
};

export const getShopCurrencyName = (currency: ShopCurrency): string => {
  switch (currency) {
    case 'galleons': return 'Galeões';
    case 'sickles': return 'Sicles';
    case 'knuts': return 'Nuques';
    default: return 'Moedas';
  }
};

export const shopCategories: ShopCategory[] = ['wands', 'robes', 'books', 'potions', 'accessories'];
