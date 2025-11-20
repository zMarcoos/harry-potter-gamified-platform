import { NextRequest, NextResponse } from 'next/server';
import {
  userService,
  UpdateUserInputSchema
} from '@/lib/services/user.service';
import { z } from 'zod/v4';

export async function GET(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const userId = params.id;

    const user = await userService.getUserById(userId);

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: 'Usuário não encontrado',
          timestamp: new Date().toISOString(),
        },
        { status: 404 },
      );
    }

    const { password, ...safeUser } = user;

    return NextResponse.json({
      success: true,
      data: safeUser,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Erro interno do servidor',
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const userId = params.id;
    const body = await request.json();

    const validatedData = UpdateUserInputSchema.parse(body);

    const updatedUser = await userService.updateUser(userId, validatedData);

    if (!updatedUser) {
      return NextResponse.json(
        {
          success: false,
          message: 'Usuário não encontrado',
          timestamp: new Date().toISOString(),
        },
        { status: 404 },
      );
    }

    const { password, ...safeUser } = updatedUser;

    return NextResponse.json({
      success: true,
      data: safeUser,
      message: 'Usuário atualizado com sucesso',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          message: 'Dados inválidos',
          errors: error.errors,
          timestamp: new Date().toISOString(),
        },
        { status: 400 },
      );
    }

    if (error instanceof Error) {
      return NextResponse.json(
        {
          success: false,
          message: error.message,
          timestamp: new Date().toISOString(),
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: 'Erro interno do servidor',
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const userId = params.id;

    const deleted = await userService.deleteUser(userId);

    if (!deleted) {
      return NextResponse.json(
        {
          success: false,
          message: 'Usuário não encontrado',
          timestamp: new Date().toISOString(),
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Usuário deletado com sucesso',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Erro ao deletar usuário:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Erro interno do servidor',
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
}
