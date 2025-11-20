import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

type AuthCookiePayload = {
  accessToken: string;
  refreshToken: string;
};

export const ACCESS_TTL_SECONDS = 60 * 15; // 15 minutos
export const REFRESH_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 dias

export const COOKIE_NAMES = {
  access: 'access_token',
  refresh: 'refresh_token',
} as const;

export const COOKIE_OPTIONS = {
  httpOnly: true as const,
  path: '/' as const,
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
};

export async function getCookie(name: string) {
  const cookie = await cookies();
  return cookie.get(name)?.value;
}

export function getCookieByRequest(request: NextRequest, name: string) {
  return request.cookies.get(name)?.value;
}

export async function hasCookie(name: string) {
  const cookie = await cookies();
  return cookie.has(name);
}

export function setAuthCookies<T>(
  response: NextResponse<T>,
  tokens: AuthCookiePayload,
): NextResponse<T> {
  const { accessToken, refreshToken } = tokens;

  response.cookies.set(COOKIE_NAMES.access, accessToken, {
    ...COOKIE_OPTIONS,
    maxAge: ACCESS_TTL_SECONDS,
  });

  response.cookies.set(COOKIE_NAMES.refresh, refreshToken, {
    ...COOKIE_OPTIONS,
    maxAge: REFRESH_TTL_SECONDS,
  });

  return response;
}

export function clearAuthCookies<T>(response: NextResponse<T>): NextResponse<T> {
  response.cookies.delete(COOKIE_NAMES.access);
  response.cookies.delete(COOKIE_NAMES.refresh);
  return response;
}

export function createAuthResponse<T>(
  body: T,
  tokens: AuthCookiePayload,
  init?: ResponseInit,
): NextResponse<T> {
  const response = NextResponse.json(body, init);
  return setAuthCookies(response, tokens);
}

export function createClearAuthResponse<T>(
  body: T,
  init?: ResponseInit,
): NextResponse<T> {
  const response = NextResponse.json(body, init);
  return clearAuthCookies(response);
}
