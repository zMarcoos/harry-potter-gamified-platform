import { compare, hash } from 'bcryptjs';

const PASSWORD_HASH_SALT = 10;

export const hashPassword = async (password: string) => {
  return await hash(password, PASSWORD_HASH_SALT);
};

export const verifyPassword = async (
  password: string,
  toVerifyPassword: string,
) => {
  if (!password) return false;
  return await compare(toVerifyPassword, password);
};
