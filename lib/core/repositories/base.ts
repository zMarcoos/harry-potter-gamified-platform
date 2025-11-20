import { dataManager } from '@/lib/core/utils/data-manager';
import { randomUUID } from 'node:crypto';
import { readdirSync } from 'node:fs';
import fs from 'node:fs/promises';
import { join } from 'node:path';
import { z } from 'zod/v4';

export type BaseMeta = {
  id: string;
};

export function makeRepository<T extends BaseMeta>(
  relativePathWithoutExtension: string,
  schema: z.ZodType<T[]>,
) {
  const repository = {
    async all(): Promise<T[]> {
      const rawData = await dataManager.get<unknown[]>(
        relativePathWithoutExtension,
        [],
      );
      try {
        return schema.parse(rawData);
      } catch (error) {
        console.error(
          `[VALIDAÇÃO FALHOU] Os dados em '${relativePathWithoutExtension}.json' não correspondem ao schema.`,
          error,
        );
        return [];
      }
    },

    async create(creationInput: Omit<T, 'id'>): Promise<T> {
      const dataList = await repository.all();
      const newItem = {
        ...creationInput,
        id: randomUUID(),
      } as T;

      dataList.push(newItem);
      await dataManager.set(relativePathWithoutExtension, dataList);
      return newItem;
    },

    async existsWhere(
      searchConditions: Partial<Omit<T, 'id'>>,
    ): Promise<boolean> {
      const dataList = await repository.all();
      const searchConditionKeys = Object.keys(
        searchConditions,
      ) as (keyof typeof searchConditions)[];
      if (searchConditionKeys.length === 0) return false;
      return dataList.some((dataItem) =>
        searchConditionKeys.every(
          (key) => dataItem[key as keyof T] === searchConditions[key],
        ),
      );
    },

    async findById(id: string): Promise<T | null> {
      const dataList = await repository.all();
      return dataList.find((dataItem) => dataItem.id === id) ?? null;
    },

    async findFirstWhere(
      searchConditions: Partial<Omit<T, 'id'>>,
    ): Promise<T | null> {
      const dataList = await repository.all();
      const searchConditionKeys = Object.keys(
        searchConditions,
      ) as (keyof typeof searchConditions)[];
      if (searchConditionKeys.length === 0) return null;
      return (
        dataList.find((dataItem) =>
          searchConditionKeys.every(
            (key) => dataItem[key as keyof T] === searchConditions[key],
          ),
        ) ?? null
      );
    },

    async findManyWhere(searchConditions: Partial<T>): Promise<T[]> {
      const dataList = await repository.all();
      const searchConditionKeys = Object.keys(
        searchConditions,
      ) as (keyof typeof searchConditions)[];
      if (searchConditionKeys.length === 0) return dataList;
      return dataList.filter((dataItem) =>
        searchConditionKeys.every(
          (key) => dataItem[key as keyof T] === searchConditions[key],
        ),
      );
    },

    async remove(id: string): Promise<boolean> {
      const dataList = await repository.all();
      const itemIndex = dataList.findIndex((dataItem) => dataItem.id === id);
      if (itemIndex === -1) return false;
      dataList.splice(itemIndex, 1);
      await dataManager.set(relativePathWithoutExtension, dataList);
      return true;
    },

    async update(
      id: string,
      updatePayload:
        | Partial<Omit<T, 'id'>>
        | ((current: T) => Partial<Omit<T, 'id'>>),
    ): Promise<T | null> {
      const dataList = await repository.all();
      const itemIndex = dataList.findIndex((dataItem) => dataItem.id === id);
      if (itemIndex === -1) return null;

      const existingItem = dataList[itemIndex];
      const resolvedUpdates =
        typeof updatePayload === 'function'
          ? updatePayload(existingItem)
          : updatePayload;

      dataList[itemIndex] = { ...existingItem, ...resolvedUpdates };
      await dataManager.set(relativePathWithoutExtension, dataList);
      return dataList[itemIndex];
    },

    withClientView<
      TClient extends BaseMeta,
      TCreate extends Omit<T, 'id'>,
    >(
      clientSchema: z.ZodType<TClient>,
      clientArraySchema: z.ZodType<TClient[]>,
    ) {
      return {
        all: async () => {
          const internalData = await repository.all();
          return clientArraySchema.parse(internalData);
        },

        findById: async (id: string) => {
          const internalItem = await repository.findById(id);
          return internalItem ? clientSchema.parse(internalItem) : null;
        },

        findFirstWhere: async (conditions: Partial<Omit<TClient, 'id'>>) => {
          const internalItem = await repository.findFirstWhere(
            conditions as Partial<Omit<T, 'id'>>,
          );
          return internalItem ? clientSchema.parse(internalItem) : null;
        },

        findManyWhere: async (conditions: Partial<TClient>) => {
          const internalData = await repository.findManyWhere(
            conditions as Partial<T>,
          );
          return clientArraySchema.parse(internalData);
        },

        existsWhere: async (conditions: Partial<Omit<TClient, 'id'>>) => {
          return repository.existsWhere(conditions as Partial<Omit<T, 'id'>>);
        },

        create: async (input: TCreate) => {
          const newInternalItem = await repository.create(input);
          return clientSchema.parse(newInternalItem);
        },

        remove: async (id: string) => {
          return repository.remove(id);
        },

        update: async (
          id: string,
          updates:
            | Partial<Omit<TClient, 'id'>>
            | ((current: TClient) => Partial<Omit<TClient, 'id'>>),
        ) => {
          let updatePayload:
            | Partial<Omit<T, 'id'>>
            | ((current: T) => Partial<Omit<T, 'id'>>);

          if (typeof updates === 'function') {
            updatePayload = (currentInternal: T): Partial<Omit<T, 'id'>> => {
              const currentClient = clientSchema.parse(currentInternal);
              return updates(currentClient) as Partial<Omit<T, 'id'>>;
            };
          } else {
            updatePayload = updates as Partial<Omit<T, 'id'>>;
          }

          const updatedInternalItem = await repository.update(id, updatePayload);
          return updatedInternalItem
            ? clientSchema.parse(updatedInternalItem)
            : null;
        },
      };
    },
  };
  return repository;
}

export function makeCollectionRepository<T extends BaseMeta>(
  directoryPath: string,
  schema: z.ZodType<T>,
) {
  const getEntityRepository = (id: string) => {
    return makeRepository<T>(`${directoryPath}/${id}`, z.array(schema));
  };

  const getAllEntityIds = (): string[] => {
    const fullDirectoryPath = join(process.cwd(), 'data', directoryPath);
    try {
      return readdirSync(fullDirectoryPath)
        .filter((file) => file.endsWith('.json'))
        .map((file) => file.replace('.json', ''));
    } catch (error) {
      return [];
    }
  };

  const repository = {
    async all(): Promise<T[]> {
      const allEntityIds = getAllEntityIds();
      const allEntitiesPromises = allEntityIds.map(async (id) => {
        const entityRepository = getEntityRepository(id);
        const content = await entityRepository.all();
        return content[0];
      });
      const allEntities = await Promise.all(allEntitiesPromises);
      return allEntities.filter(Boolean);
    },

    async findById(id: string): Promise<T | null> {
      const entityRepository = getEntityRepository(id);
      const dataList = await entityRepository.all();
      return dataList[0] ?? null;
    },

    async existsWhere(
      searchConditions: Partial<Omit<T, 'id'>>,
    ): Promise<boolean> {
      const dataList = await repository.all();
      const searchConditionKeys = Object.keys(
        searchConditions,
      ) as (keyof typeof searchConditions)[];
      if (searchConditionKeys.length === 0) return false;
      return dataList.some((dataItem) =>
        searchConditionKeys.every(
          (key) => dataItem[key as keyof T] === searchConditions[key],
        ),
      );
    },

    async findFirstWhere(
      searchConditions: Partial<Omit<T, 'id'>>,
    ): Promise<T | null> {
      const dataList = await repository.all();
      const searchConditionKeys = Object.keys(
        searchConditions,
      ) as (keyof typeof searchConditions)[];
      if (searchConditionKeys.length === 0) return null;
      return (
        dataList.find((dataItem) =>
          searchConditionKeys.every(
            (key) => dataItem[key as keyof T] === searchConditions[key],
          ),
        ) ?? null
      );
    },

    async findManyWhere(
      searchConditions: Partial<Omit<T, 'id'>>,
    ): Promise<T[]> {
      const dataList = await repository.all();
      const searchConditionKeys = Object.keys(
        searchConditions,
      ) as (keyof typeof searchConditions)[];
      if (searchConditionKeys.length === 0) return dataList;
      return dataList.filter((dataItem) =>
        searchConditionKeys.every(
          (key) => dataItem[key as keyof T] === searchConditions[key],
        ),
      );
    },

    async create(creationInput: Omit<T, 'id'> | T): Promise<T> {
      const resolvedEntityId = (creationInput as T).id ?? randomUUID();
      const newItem = {
        ...creationInput,
        id: resolvedEntityId,
      } as T;

      const filePath = `${directoryPath}/${resolvedEntityId}`;
      await dataManager.set(filePath, [newItem]);
      return newItem;
    },

    async update(
      id: string,
      updatePayload:
        | Partial<Omit<T, 'id'>>
        | ((current: T) => Partial<Omit<T, 'id'>>),
    ): Promise<T | null> {
      const entityRepository = getEntityRepository(id);
      const updatedItem = await entityRepository.update(id, updatePayload);
      return updatedItem;
    },

    async remove(id: string): Promise<boolean> {
      const filePath = join(
        process.cwd(),
        'data',
        `${directoryPath}/${id}.json`,
      );
      try {
        await fs.unlink(filePath);
        return true;
      } catch (error: any) {
        if (error.code === 'ENOENT') return true;
        console.error(`Falha ao remover o arquivo ${filePath}:`, error);
        return false;
      }
    },
  };
  return repository;
}
