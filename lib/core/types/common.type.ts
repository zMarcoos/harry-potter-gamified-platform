import { z } from 'zod/v4';

export const RoleSchema = z.enum(['student', 'professor', 'admin']);
export const ThemeSchema = z.enum(['light', 'dark']);
export const LangSchema = z.enum(['pt-BR', 'en-US']);
