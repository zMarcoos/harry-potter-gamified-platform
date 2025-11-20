import { cookies } from 'next/headers';
import { type NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken } from '@/lib/core/utils/jwt';
import {
  DataServiceError,
  dataServiceServer,
} from '@/services/data.service.server';

export async function PUT(request: NextRequest) {
  try {
    console.log(
      '[v0] API /users/update: Iniciando processamento da requisição',
    );

    const cookieStore = await cookies();
    const access = cookieStore.get('access_token')?.value;

    if (!access) {
      console.log('[v0] API /users/update: Token não encontrado');
      return NextResponse.json(
        { error: 'Token não encontrado', ok: false },
        { status: 401 },
      );
    }

    const payload = await verifyAccessToken(access);
    if (!payload) {
      console.log('[v0] API /users/update: Token inválido');
      return NextResponse.json(
        { error: 'Token inválido', ok: false },
        { status: 401 },
      );
    }

    const userId = payload.subjectId;
    const updates = await request.json();

    console.log(
      '[v0] API /users/update: Dados recebidos para usuário',
      userId,
      ':',
      updates,
    );

    try {
      const updatedUser = await dataServiceServer.updateUser(userId, updates);

      console.log('[v0] API /users/update: Dados salvos com sucesso');

      return NextResponse.json({
        message: 'Usuário atualizado com sucesso',
        ok: true,
        user: updatedUser,
      });
    } catch (error) {
      if (error instanceof DataServiceError) {
        console.error(
          '[v0] Erro do DataService ao atualizar usuário:',
          error.message,
        );
        return NextResponse.json(
          {
            error: error.message,
            ok: false,
          },
          { status: 400 },
        );
      }
      throw error;
    }
  } catch (error) {
    console.error('[v0] Erro ao atualizar usuário:', error);
    return NextResponse.json(
      {
        error: 'Erro interno do servidor',
        ok: false,
      },
      { status: 500 },
    );
  }
}
