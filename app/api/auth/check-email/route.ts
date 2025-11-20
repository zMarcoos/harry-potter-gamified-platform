import { NextRequest, NextResponse } from 'next/server';
import { globalRepositories } from '@/lib/core/repositories';
import { validate } from '@/lib/core/utils/type-validator';
import { emailCheckSchema } from '@/lib/core/types/auth.type';

export async function POST(request: NextRequest) {
  const json = await request.json();

  const parsed = validate(emailCheckSchema, json);
  if (!parsed.ok) return NextResponse.json({ error: 'Email inválido.' }, { status: 400 });

  const { users } = globalRepositories;

  try {
    const { email } = parsed.data;
    const emailExists = await users.existsWhere({ email });

    return NextResponse.json({ exists: emailExists });
  } catch (error) {
    console.error('Erro ao verificar email:', error);

    return NextResponse.json(
      { error: 'Erro interno do servidor.' },
      { status: 500 },
    );
  }
}
