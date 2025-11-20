import { NextResponse } from 'next/server';
import {
  createTokens,
  verifyRefreshToken,
} from '@/lib/core/utils/jwt';
import { COOKIE_NAMES, createAuthResponse, getCookie } from '@/lib/core/utils/cookie';

export async function POST() {
  const refreshCookieToken = await getCookie(COOKIE_NAMES.refresh);
  if (!refreshCookieToken) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  try {
    const payload = await verifyRefreshToken(refreshCookieToken);
    if (!payload) return new NextResponse(null, { status: 401 });

    const { accessToken, refreshToken } = await createTokens(payload);

    return createAuthResponse(
      null,
      { accessToken, refreshToken },
      { status: 204 },
    );
  } catch (error) {
    console.error('Refresh token error:', error);

    return NextResponse.json(
      { error: 'unauthorized' },
      { status: 401 },
    );
  }
}
