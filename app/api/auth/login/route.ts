import { type NextRequest, NextResponse } from 'next/server';
import { globalRepositories } from '@/lib/core/repositories';
import { verifyPassword } from '@/lib/core/utils/bcrypt';
import {
  createTokens,
  type TokenPayload,
} from '@/lib/core/utils/jwt';
import { validate } from '@/lib/core/utils/type-validator';
import { loginSchema } from '@/lib/core/types/auth.type';
import { ClientUserSchema } from '@/lib/core/types/user.type';
import { createAuthResponse } from '@/lib/core/utils/cookie';

export async function POST(request: NextRequest) {
  try {
    const json = await request.json();

    const loginParsed = validate(loginSchema, json);
    if (!loginParsed.ok) {
      return NextResponse.json(
        { error: 'Email e senha são obrigatórios' },
        { status: 400 },
      );
    }

    const { email, password } = loginParsed.data;
    const { usersInternal } = globalRepositories;

    const serverUser = await usersInternal.findFirstWhere({ email });
    if (!serverUser) {
      return NextResponse.json(
        { error: 'Credenciais inválidas' },
        { status: 401 },
      );
    }

    const isValidPassword = await verifyPassword(serverUser.auth.password, password);
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Credenciais inválidas' },
        { status: 401 },
      );
    }

    const payload: TokenPayload = {
      email: serverUser.email,
      role: serverUser.role ?? 'student',
      subjectId: serverUser.id,
    };

    const { accessToken, refreshToken } = await createTokens(payload);

    const clientUser = ClientUserSchema.parse(serverUser);

    return createAuthResponse({ user: clientUser }, { accessToken, refreshToken });
  } catch (error) {
    console.error('[auth/login] error:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 },
    );
  }
}
