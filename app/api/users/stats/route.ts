import { NextRequest, NextResponse } from 'next/server';
import { userService } from '@/lib/services/user.service';

export async function GET(request: NextRequest) {
  try {
    const stats = await userService.getUserStats();

    return NextResponse.json({
      success: true,
      data: stats,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Erro ao buscar estatísticas de usuários:', error);
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
