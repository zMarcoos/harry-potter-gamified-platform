import { NextRequest, NextResponse } from 'next/server';
import { userService, CreateUserInputSchema } from '@/lib/core/services/class/users.service';
import { z } from 'zod/v4';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');
    const house = searchParams.get('house');
    const search = searchParams.get('search');
    const limit = searchParams.get('limit');

    let users;

    if (search) {
      users = await userService.searchUsers(search);
    } else if (role) {
      users = await userService.getUsersByRole(role as any);
    } else if (house) {
      users = await userService.getUsersByHouse(house);
    } else {
      users = await userService.getAllUsers();
    }

    if (limit) {
      const limitNum = parseInt(limit);
      if (!isNaN(limitNum) && limitNum > 0) {
        users = users.slice(0, limitNum);
      }
    }

    const safeUsers = users.map((user) => {
      const { password, ...safeUser } = user;
      return safeUser;
    });

    return NextResponse.json({
      success: true,
      data: safeUsers,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const validatedData = CreateUserInputSchema.parse(body);

    const newUser = await userService.createUser(validatedData);

    const { password, ...safeUser } = newUser;

    return NextResponse.json(
      {
        success: true,
        data: safeUser,
        message: 'Usuário criado com sucesso',
        timestamp: new Date().toISOString(),
      },
      { status: 201 },
    );
  } catch (error) {
    console.error('Erro ao criar usuário:', error);

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
