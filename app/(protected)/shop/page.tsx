'use client';

import { useMemo } from 'react';
import { Button } from '@/lib/client/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/lib/client/components/ui/card';
import { Badge } from '@/lib/client/components/ui/badge';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/lib/client/components/ui/tabs';
import { Coins, Star, Eye, ShoppingBag } from 'lucide-react';
import {
  useAuthState,
  useAuthActions,
} from '@/lib/client/contexts/auth-context';
import { useClassStore } from '@/lib/client/store/class-store';
import { useRouter } from 'next/navigation';
import { LoadingScreen } from '@/lib/client/components/loading-screen';
import { AuthenticatedLayout } from '@/lib/client/components/layout/AuthenticatedLayout';
import {
  ShopItem,
  ShopCategory,
  shopItemsData,
  getShopRarityColor,
  getShopRarityText,
  getShopCurrencyIcon,
  getShopCurrencyName,
  shopCategories,
} from '@/lib/core/domain/shop';
import { Header } from '@/lib/client/components/great-hall/header';

interface DisplayShopItem extends ShopItem {
  owned: boolean;
}

function ShopPageContent() {
  const { user } = useAuthState();
  const { logout } = useAuthActions();
  const { classInfo } = useClassStore();
  const router = useRouter();

  if (!user || !classInfo) {
    console.error('ShopPageContent renderizado sem user ou classInfo!');
    return <LoadingScreen message='Aguardando dados...' />;
  }

  const userCurrencies = useMemo(
    () => ({
      galleons: classInfo.users?.[user.id]?.progress.currencies.galleons ?? 0,
      sickles: classInfo.users?.[user.id]?.progress.currencies.sickles ?? 0,
      knuts: classInfo.users?.[user.id]?.progress.currencies.knuts ?? 0,
    }),
    [classInfo, user.id],
  );

  const userInventory = useMemo(
    () => classInfo.users?.[user.id]?.inventory ?? [],
    [classInfo, user.id],
  );

  const displayShopItems: DisplayShopItem[] = useMemo(() => {
    return shopItemsData.map((item) => ({
      ...item,
      owned: userInventory.includes(item.id),
    }));
  }, [userInventory]);

  const canAfford = (item: ShopItem) => {
    const currencyKey = item.currency as keyof typeof userCurrencies;
    return (
      userCurrencies[currencyKey] !== undefined &&
      userCurrencies[currencyKey] >= item.price
    );
  };

  const handlePurchase = (item: ShopItem) => {
    if (canAfford(item) && !userInventory.includes(item.id)) {
      console.log(`Comprando ${item.name} por ${item.price} ${item.currency}`);
    }
  };

  const filterByCategory = (category: ShopCategory) => {
    return displayShopItems.filter((item) => item.category === category);
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-background via-card to-background'>
      <Header
        title='Beco Diagonal'
        subtitle='Loja Mágica de Hogwarts'
        icon={ShoppingBag}
        showBackButton={true}
        backButtonHref='/great-hall'
        showCurrency='all'
        user={user}
        classInfo={classInfo}
        onLogout={logout}
      />

      <div className='container mx-auto px-4 py-4 md:py-8'>
        <Tabs defaultValue='all' className='space-y-4 md:space-y-6'>
          <TabsList className='grid w-full grid-cols-3 sm:grid-cols-6 bg-card h-auto'>
            <TabsTrigger value='all' className='text-xs sm:text-sm py-2'>
              <span className='hidden sm:inline'>Todos</span>
              <span className='sm:hidden'>All</span>
            </TabsTrigger>
            {shopCategories.map((category) => {
              const iconMap: Record<ShopCategory, string> = {
                wands: '🪄',
                robes: '👘',
                books: '📚',
                potions: '🧪',
                accessories: '💍',
              };
              const nameMap: Record<ShopCategory, string> = {
                wands: 'Varinhas',
                robes: 'Vestes',
                books: 'Livros',
                potions: 'Poções',
                accessories: 'Acessórios',
              };
              const isHiddenMobile = !['wands', 'robes'].includes(category);
              return (
                <TabsTrigger
                  key={category}
                  value={category}
                  className={`text-xs sm:text-sm py-2 ${isHiddenMobile ? 'hidden sm:flex' : ''}`}
                >
                  <span className='hidden sm:inline'>{nameMap[category]}</span>
                  <span className='sm:hidden'>{iconMap[category]}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          <TabsContent value='all' className='space-y-4 md:space-y-6'>
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6'>
              {displayShopItems.map((item) => (
                <Card
                  key={item.id}
                  className={`relative overflow-hidden hover:shadow-lg transition-all flex flex-col h-full min-h-[380px] sm:min-h-[420px] ${
                    item.owned ? 'opacity-75' : ''
                  }`}
                >
                  <div
                    className={`absolute top-0 right-0 w-0 h-0 border-l-[30px] sm:border-l-[40px] border-l-transparent border-t-[30px] sm:border-t-[40px] ${getShopRarityColor(item.rarity)}`}
                  />
                  <CardHeader className='pb-3 flex-shrink-0'>
                    <div className='flex items-center justify-between'>
                      <div className='text-3xl sm:text-4xl'>{item.icon}</div>
                      {item.owned && (
                        <Badge className='bg-green-500 text-xs text-white'>
                          <Eye className='w-3 h-3 mr-1' />
                          <span className='hidden sm:inline'>Possuído</span>
                          <span className='sm:hidden'>✓</span>
                        </Badge>
                      )}
                    </div>
                    <CardTitle className='text-base sm:text-lg line-clamp-2 min-h-[2.5rem] sm:min-h-[3.5rem]'>
                      {item.name}
                    </CardTitle>
                    <CardDescription className='text-xs sm:text-sm line-clamp-3 min-h-[3rem] sm:min-h-[4rem]'>
                      {item.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className='flex flex-col flex-grow space-y-3 sm:space-y-4'>
                    <div className='space-y-2 flex-grow'>
                      <Badge
                        className={`${getShopRarityColor(item.rarity)} text-white`}
                        variant='default'
                      >
                        <span className='text-xs'>
                          {getShopRarityText(item.rarity)}
                        </span>
                      </Badge>
                      <div className='space-y-1'>
                        <h4 className='text-xs sm:text-sm font-semibold'>
                          Efeitos:
                        </h4>
                        <div className='min-h-[2.5rem] sm:min-h-[3rem]'>
                          {item.effects.map((effect, index) => (
                            <div
                              key={index}
                              className='text-xs text-muted-foreground flex items-center gap-1 mb-1'
                            >
                              <Star className='w-3 h-3 flex-shrink-0' />
                              <span className='line-clamp-1'>{effect}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className='flex items-center justify-between flex-shrink-0'>
                      <div className='flex items-center gap-1 sm:gap-2'>
                        <span className='text-lg sm:text-xl'>
                          {getShopCurrencyIcon(item.currency)}
                        </span>
                        <span className='text-base sm:text-lg font-bold'>
                          {item.price}
                        </span>
                        <span className='text-xs sm:text-sm text-muted-foreground'>
                          {getShopCurrencyName(item.currency)}
                        </span>
                      </div>
                    </div>

                    <div className='mt-auto pt-3 sm:pt-4 flex-shrink-0'>
                      <Button
                        onClick={() => handlePurchase(item)}
                        disabled={!canAfford(item) || item.owned}
                        className='w-full h-9 sm:h-10 text-xs sm:text-sm transition-all duration-300 hover:scale-105'
                        variant={
                          item.owned
                            ? 'secondary'
                            : canAfford(item)
                              ? 'default'
                              : 'outline'
                        }
                      >
                        {item.owned ? (
                          <>
                            <Eye className='w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2' />
                            <span className='hidden sm:inline'>Possuído</span>
                            <span className='sm:hidden'>Possuído</span>
                          </>
                        ) : canAfford(item) ? (
                          <>
                            <Coins className='w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2' />
                            Comprar
                          </>
                        ) : (
                          <span className='text-center'>
                            <span className='hidden sm:inline'>
                              Moedas Insuficientes
                            </span>
                            <span className='sm:hidden'>Sem Moedas</span>
                          </span>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {shopCategories.map((category) => (
            <TabsContent
              key={category}
              value={category}
              className='space-y-4 md:space-y-6'
            >
              <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6'>
                {filterByCategory(category).map((item) => (
                  <Card
                    key={item.id}
                    className={`relative overflow-hidden hover:shadow-lg transition-all flex flex-col h-full min-h-[380px] sm:min-h-[420px] ${
                      item.owned ? 'opacity-75' : ''
                    }`}
                  >
                    <div
                      className={`absolute top-0 right-0 w-0 h-0 border-l-[30px] sm:border-l-[40px] border-l-transparent border-t-[30px] sm:border-t-[40px] ${getShopRarityColor(item.rarity)}`}
                    />
                    <CardHeader className='pb-3 flex-shrink-0'>
                      <div className='flex items-center justify-between'>
                        <div className='text-3xl sm:text-4xl'>{item.icon}</div>
                        {item.owned && (
                          <Badge className='bg-green-500 text-xs text-white'>
                            <Eye className='w-3 h-3 mr-1' />
                            <span className='hidden sm:inline'>Possuído</span>
                            <span className='sm:hidden'>✓</span>
                          </Badge>
                        )}
                      </div>
                      <CardTitle className='text-base sm:text-lg line-clamp-2 min-h-[2.5rem] sm:min-h-[3.5rem]'>
                        {item.name}
                      </CardTitle>
                      <CardDescription className='text-xs sm:text-sm line-clamp-3 min-h-[3rem] sm:min-h-[4rem]'>
                        {item.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className='flex flex-col flex-grow space-y-3 sm:space-y-4'>
                      <div className='space-y-2 flex-grow'>
                        <Badge
                          className={`${getShopRarityColor(item.rarity)} text-white`}
                          variant='default'
                        >
                          <span className='text-xs'>
                            {getShopRarityText(item.rarity)}
                          </span>
                        </Badge>
                        <div className='space-y-1'>
                          <h4 className='text-xs sm:text-sm font-semibold'>
                            Efeitos:
                          </h4>
                          <div className='min-h-[2.5rem] sm:min-h-[3rem]'>
                            {item.effects.map((effect, index) => (
                              <div
                                key={index}
                                className='text-xs text-muted-foreground flex items-center gap-1 mb-1'
                              >
                                <Star className='w-3 h-3 flex-shrink-0' />
                                <span className='line-clamp-1'>{effect}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className='flex items-center justify-between flex-shrink-0'>
                        <div className='flex items-center gap-1 sm:gap-2'>
                          <span className='text-lg sm:text-xl'>
                            {getShopCurrencyIcon(item.currency)}
                          </span>
                          <span className='text-base sm:text-lg font-bold'>
                            {item.price}
                          </span>
                          <span className='text-xs sm:text-sm text-muted-foreground'>
                            {getShopCurrencyName(item.currency)}
                          </span>
                        </div>
                      </div>

                      <div className='mt-auto pt-3 sm:pt-4 flex-shrink-0'>
                        <Button
                          onClick={() => handlePurchase(item)}
                          disabled={!canAfford(item) || item.owned}
                          className='w-full h-9 sm:h-10 text-xs sm:text-sm transition-all duration-300 hover:scale-105'
                          variant={
                            item.owned
                              ? 'secondary'
                              : canAfford(item)
                                ? 'default'
                                : 'outline'
                          }
                        >
                          {item.owned ? (
                            <>
                              <Eye className='w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2' />
                              <span className='hidden sm:inline'>Possuído</span>
                              <span className='sm:hidden'>Possuído</span>
                            </>
                          ) : canAfford(item) ? (
                            <>
                              <Coins className='w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2' />
                              Comprar
                            </>
                          ) : (
                            <span className='text-center'>
                              <span className='hidden sm:inline'>
                                Moedas Insuficientes
                              </span>
                              <span className='sm:hidden'>Sem Moedas</span>
                            </span>
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>

        <Card className='mt-8 magical-border card-hover border-accent/20 bg-card/60 backdrop-blur-sm'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Coins className='w-6 h-6 text-accent' />
              Câmbio de Gringotes
            </CardTitle>
            <CardDescription>
              Troque suas moedas por outras denominações (informativo)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-4 text-center'>
              <div className='p-4 rounded-lg bg-muted/30'>
                <div className='text-2xl mb-2'>🥇</div>
                <div className='font-semibold'>1 Galeão</div>
                <div className='text-sm text-muted-foreground'>= 17 Sicles</div>
              </div>
              <div className='p-4 rounded-lg bg-muted/30'>
                <div className='text-2xl mb-2'>🥈</div>
                <div className='font-semibold'>1 Sicle</div>
                <div className='text-sm text-muted-foreground'>= 29 Nuques</div>
              </div>
              <div className='p-4 rounded-lg bg-muted/30'>
                <div className='text-2xl mb-2'>💰</div>
                <div className='font-semibold'>Como Ganhar</div>
                <div className='text-sm text-muted-foreground'>
                  Quizzes, Missões, Desafios
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function ShopPageWithLayout() {
  return (
    <AuthenticatedLayout>
      <ShopPageContent />
    </AuthenticatedLayout>
  );
}
