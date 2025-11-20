import { globalRepositories } from '@/lib/core/repositories';
import { type NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const classId = searchParams.get('id');

    if (classId) {
      const classData = await globalRepositories.classes.findById(classId);

      if (!classData) {
        return NextResponse.json(
          { error: `Turma com o ID '${classId}' não encontrada.` },
          { status: 404 }
        );
      }

      const { password, ...classWithoutPassword } = classData;
      return NextResponse.json(classWithoutPassword);
    }

    const allClasses = await globalRepositories.classes.all();
    const classesWithoutPasswords = allClasses.map((clazz) => {
      const { password, ...classWithoutPassword } = clazz;
      return classWithoutPassword;
    });

    return NextResponse.json({ classes: classesWithoutPasswords });

  } catch (error: any) {
    console.error('[API ERRO /api/classes]:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor ao buscar turmas.' },
      { status: 500 }
    );
  }
}
