import { NextResponse } from 'next/server';
import { clearAuthCookies } from '@/lib/core/utils/cookie';

export async function POST() {
  try {
    const response = new NextResponse(null, { status: 204 });

    clearAuthCookies(response);

    return response;
  } catch (error) {
    console.error('Erro no logout:', error);

    const errorResponse = NextResponse.json(
      { error: 'Erro interno ao fazer logout.' },
      { status: 500 },
    );

    clearAuthCookies(errorResponse);
    return errorResponse;
  }
}
