import { ClassSchema } from '@/lib/core/types/class.type';
import {
  ClientUserSchema,
  CreateUser,
  ServerUserSchema,
  ClientUser,
  ServerUser,
} from '@/lib/core/types/user.type';
import { z } from 'zod/v4';
import { makeCollectionRepository, makeRepository } from './base';

const BaseMetaSchema = z.object({ id: z.string() });
export const ClassEntitySchema = ClassSchema.extend(BaseMetaSchema.shape);
export type ClassEntity = z.infer<typeof ClassEntitySchema>;

const usersInternalRepository = makeRepository<ServerUser>(
  'core/users',
  z.array(ServerUserSchema),
);

const usersRepository = usersInternalRepository.withClientView<
  ClientUser,
  CreateUser
>(
  ClientUserSchema,
  z.array(ClientUserSchema)
);

export const globalRepositories = {
  users: usersRepository,
  usersInternal: usersInternalRepository,
  classes: makeCollectionRepository<ClassEntity>('classes', ClassEntitySchema),
};
