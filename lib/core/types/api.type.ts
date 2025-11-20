import type { ClientUser } from './user.type';

export type ApiSucess<T> = { ok: true; data: T };
export type ApiError = { ok: false; error: string };
export type ApiResponse<T> = ApiSucess<T> | ApiError;

export type UserSuccessResponse = {
  ok: true;
  user: ClientUser;
};
