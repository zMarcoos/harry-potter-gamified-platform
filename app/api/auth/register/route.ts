import { NextRequest, NextResponse } from 'next/server';
import { globalRepositories } from '@/lib/core/repositories';
import { hashPassword } from '@/lib/core/utils/bcrypt';
import {
  createTokens, type TokenPayload
} from '@/lib/core/utils/jwt';
import { validate } from '@/lib/core/utils/type-validator';
import { registerSchema } from '@/lib/core/types/auth.type';
import {
  ClientUserSchema,
  CreateUser,
  CreateUserSchema,
} from '@/lib/core/types/user.type';
import { now } from '@/lib/core/utils/utils';
import { createAuthResponse } from '@/lib/core/utils/cookie';

export async function POST(request: NextRequest) {
  const json = await request.json();

  const parsed = validate(registerSchema, json);
  if (!parsed.ok) {
    return NextResponse.json(
      { details: parsed.errors, error: 'Dados de registro inválidos.' },
      { status: 400 },
    );
  }

  const { email, name, password, role, house } = parsed.data;
  const { users, usersInternal } = globalRepositories;

  try {
    const alreadyExists = await users.existsWhere({ email });
    if (alreadyExists) {
      return NextResponse.json(
        { error: 'Este e-mail já está em uso.' },
        { status: 409 },
      );
    }

    const userDataToCreate: CreateUser = {
      auth: {
        password: await hashPassword(password),
      },
      email,
      house,
      profile: {
        avatar:
          'https://i.pinimg.com/originals/a0/64/bb/a064bb61c112493c31ac052d21220b70.jpg',
        name,
      },
      role,
      activity: {
        isActive: false,
        createdAt: now(),
        lastSeen: now(),
      },
      enrollments: [],
      preferences: {
        language: 'pt-BR',
        notifications: true,
        theme: 'dark',
      },
    };

    const fullUserData = CreateUserSchema.parse(userDataToCreate);
    const user = await usersInternal.create(fullUserData);

    const payload: TokenPayload = {
      email: user.email,
      role: user.role,
      subjectId: user.id,
    };

    const { accessToken, refreshToken } = await createTokens(payload);

    const clientUser = ClientUserSchema.parse(user);

    return createAuthResponse(
      { user: clientUser },
      { accessToken, refreshToken },
    );
  } catch (error) {
    console.error('Erro na API de Registro:', error);

    return NextResponse.json(
      { error: 'Erro interno do servidor.' },
      { status: 500 },
    );
  }
}
