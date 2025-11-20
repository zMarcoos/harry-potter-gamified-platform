import { type NextRequest, NextResponse } from 'next/server';
import { globalRepositories } from '@/lib/core/repositories';
import { verifyAccessToken } from '@/lib/core/utils/jwt';
import {
  createClearAuthResponse,
  COOKIE_NAMES,
  getCookieByRequest,
} from '@/lib/core/utils/cookie';

export async function GET(request: NextRequest) {
  try {
    const accessToken = getCookieByRequest(request, COOKIE_NAMES.access);
    if (!accessToken) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

    const payload = await verifyAccessToken(accessToken);
    if (!payload) {
      return createClearAuthResponse(
        { error: 'unauthorized' },
        { status: 401 },
      );
    }

    const { users } = globalRepositories;
    const user = await users.findById(payload.subjectId);

    if (!user) {
      return createClearAuthResponse(
        { error: 'user_not_found' },
        { status: 404 },
      );
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Erro ao buscar usuário:', error);

    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 },
    );
  }
}

