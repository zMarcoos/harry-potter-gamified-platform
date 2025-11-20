import { globalRepositories, type ClassEntity } from '@/lib/core/repositories';
import { ShopItem, ShopItemSchema } from '@/lib/core/types/shop.type';
import { randomUUID } from 'node:crypto';
import { getClassOrThrow } from '../../utils/class';

function findItemIndex(shop: ShopItem[], itemId: string): number {
  return shop.findIndex((shopItem) => shopItem.id === itemId);
}

export const shopService = {
  async list(classId: string): Promise<ShopItem[]> {
    const clazz = await getClassOrThrow(classId);
    return clazz.shop ?? [];
  },

  async getById(classId: string, itemId: string): Promise<ShopItem | null> {
    const clazz = await getClassOrThrow(classId);
    return (clazz.shop ?? []).find((shopItem) => shopItem.id === itemId) ?? null;
  },

  async create(
    classId: string,
    input: Omit<ShopItem, 'id'>,
  ): Promise<ShopItem> {
    const parsed = ShopItemSchema.omit({ id: true }).parse(input);

    const newItem: ShopItem = {
      ...parsed,
      id: randomUUID(),
    };

    await globalRepositories.classes.update(classId, (clazz) => {
      if (!clazz) throw new Error(`Turma '${classId}' não encontrada.`);
      const nextShop = [...(clazz.shop ?? []), newItem];
      return { shop: nextShop };
    });

    return newItem;
  },

  async update(
    classId: string,
    itemId: string,
    updates: Partial<Omit<ShopItem, 'id'>>,
  ): Promise<ShopItem> {
    let parsedItem: ShopItem | null = null;

    const updatedClass = await globalRepositories.classes.update(
      classId,
      (clazz) => {
        if (!clazz) throw new Error(`Turma '${classId}' não encontrada.`);
        const shop = clazz.shop ?? [];
        const index = findItemIndex(shop, itemId);
        if (index === -1) throw new Error(`Item '${itemId}' não encontrado.`);

        const candidate: ShopItem = { ...shop[index], ...updates, id: itemId };
        const parsed = ShopItemSchema.parse(candidate);
        parsedItem = parsed;

        const nextShop = [...shop];
        nextShop[index] = parsed;
        return { shop: nextShop };
      },
    );

    if (!updatedClass)
      throw new Error(`Turma '${classId}' não encontrada para atualização.`);
    if (!parsedItem) throw new Error('Falha ao atualizar item.');

    return parsedItem;
  },

  async remove(classId: string, itemId: string): Promise<void> {
    await globalRepositories.classes.update(classId, (clazz) => {
      if (!clazz) throw new Error(`Turma '${classId}' não encontrada.`);
      const shop = clazz.shop ?? [];
      const index = findItemIndex(shop, itemId);
      if (index === -1) throw new Error(`Item '${itemId}' não encontrado.`);

      const nextShop = shop.filter((shopItem) => shopItem.id !== itemId);
      return { shop: nextShop };
    });
  },

  async purchase(
    classId: string,
    userId: string,
    itemId: string,
    quantity = 1,
  ): Promise<{
    item: ShopItem;
    quantity: number;
    galleonsCharged: number;
    newBalance: number;
    remainingStock: number;
  }> {
    if (quantity <= 0) throw new Error('Quantidade deve ser positiva.');

    let result: {
      item: ShopItem;
      quantity: number;
      galleonsCharged: number;
      newBalance: number;
      remainingStock: number;
    } | null = null;

    const updatedClass = await globalRepositories.classes.update(
      classId,
      (clazz) => {
        if (!clazz) throw new Error(`Turma '${classId}' não encontrada.`);

        const user = clazz.users?.[userId];
        if (!user)
          throw new Error(`Usuário '${userId}' não encontrado na turma.`);

        const shop = clazz.shop ?? [];
        const index = findItemIndex(shop, itemId);
        if (index === -1) throw new Error(`Item '${itemId}' não encontrado.`);

        const item = shop[index];
        if (item.stock < quantity) {
          throw new Error(`Estoque insuficiente. Restam ${item.stock} unidades.`);
        }

        const totalPrice = item.price * quantity;
        const currentGalleons = user.progress.currencies.galleons;

        if (currentGalleons < totalPrice) {
          throw new Error(
            `Saldo insuficiente. Você tem ${currentGalleons} galeões e precisa de ${totalPrice}.`,
          );
        }

        const updatedItem: ShopItem = {
          ...item,
          stock: item.stock - quantity,
        };
        const nextShop = [...shop];
        nextShop[index] = ShopItemSchema.parse(updatedItem);

        const newInventory = [...(user.inventory ?? [])];
        for (let index = 0; index < quantity; index++) newInventory.push(item.id);

        const newGalleons = currentGalleons - totalPrice;

        const nextUsers: ClassEntity['users'] = {
          ...clazz.users,
          [userId]: {
            ...user,
            inventory: newInventory,
            progress: {
              ...user.progress,
              currencies: {
                ...user.progress.currencies,
                galleons: newGalleons,
              },
            },
          },
        };

        result = {
          item: updatedItem,
          quantity,
          galleonsCharged: totalPrice,
          newBalance: newGalleons,
          remainingStock: updatedItem.stock,
        };

        return {
          shop: nextShop,
          users: nextUsers,
        };
      },
    );

    if (!updatedClass)
      throw new Error(`Turma '${classId}' não encontrada para atualização.`);
    if (!result) throw new Error('Falha ao processar compra.');

    return result;
  },

  async restock(
    classId: string,
    itemId: string,
    amount: number,
  ): Promise<ShopItem> {
    if (amount <= 0)
      throw new Error('Quantidade para reposição deve ser positiva.');

    let restockedItem: ShopItem | null = null;

    const updatedClass = await globalRepositories.classes.update(
      classId,
      (clazz) => {
        if (!clazz) throw new Error(`Turma '${classId}' não encontrada.`);
        const shop = clazz.shop ?? [];
        const index = findItemIndex(shop, itemId);
        if (index === -1) throw new Error(`Item '${itemId}' não encontrado.`);

        const updated: ShopItem = {
          ...shop[index],
          stock: shop[index].stock + amount,
        };
        const parsed = ShopItemSchema.parse(updated);
        restockedItem = parsed;

        const nextShop = [...shop];
        nextShop[index] = parsed;
        return { shop: nextShop };
      },
    );

    if (!updatedClass)
      throw new Error(`Turma '${classId}' não encontrada para atualização.`);
    if (!restockedItem) throw new Error('Falha ao repor estoque.');

    return restockedItem;
  },
};
