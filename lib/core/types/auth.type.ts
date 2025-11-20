import { z } from 'zod/v4';
import { RoleSchema } from './common.type';
import type { ClientUser } from './user.type';
import { HouseIdSchema } from './house.type';

export const emailCheckSchema = z.object({
  email: z.email({ message: 'Por favor, insira um email válido.' }),
});

export const loginSchema = z.object({
  email: z.email({ message: 'Por favor, insira um email válido.' }),
  password: z
    .string()
    .nonempty({ message: 'A senha não pode estar em branco.' }),
});

export const registerSchema = z.object({
  email: z.email({
    message: 'Por favor, insira um endereço de e-mail válido.',
  }),
  house: HouseIdSchema,
  name: z.string().nonempty({ message: 'O nome é obrigatório.' }),
  password: z
    .string()
    .min(6, { message: 'A senha deve ter no mínimo 6 caracteres.' }),
  role: RoleSchema,
});

export const initialRegisterSchema = registerSchema.pick({
  email: true,
  name: true,
  password: true,
});

export type AuthContextValue = {
  user: ClientUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (params: Login) => Promise<void>;
  register: (params: Register) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (updates: Partial<ClientUser>) => Promise<void>;
};

export type Login = z.infer<typeof loginSchema>;
export type Register = z.infer<typeof registerSchema>;
