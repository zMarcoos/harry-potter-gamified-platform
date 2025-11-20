import { NextRequest, NextResponse } from 'next/server';
import { socialService } from '@/lib/core/services/class/social.service';
import { z } from 'zod/v4';
import { globalRepositories } from '@/lib/core/repositories';

const createPostPayloadSchema = z.object({
  classId: z.string().min(1, "classId é obrigatório"),
  authorId: z.string().min(1, "authorId é obrigatório"),
  content: z.string().min(1, "O conteúdo não pode estar vazio").max(2000, "O post é muito longo"),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const classId = searchParams.get('classId');

    if (!classId) {
      return NextResponse.json({ error: "O 'classId' é obrigatório." }, { status: 400 });
    }

    const posts = await socialService.list(classId);

    const enrichedPostPromises = posts.map(async (post) => {
      const authorProfile = await globalRepositories.users.findById(post.authorId);
      return {
        ...post,
        author: {
          id: post.authorId,
          name: authorProfile?.profile.name || 'Desconhecido',
          avatar: authorProfile?.profile.avatar || '',
        }
      };
    });

    const enrichedPosts = await Promise.all(enrichedPostPromises);
    return NextResponse.json(enrichedPosts);
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao buscar posts.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const validation = createPostPayloadSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: "Dados inválidos", details: validation.error.format() }, { status: 400 });
    }

    const { classId, authorId, content } = validation.data;
    const newPost = await socialService.createPost(classId, authorId, content);

    const authorProfile = await globalRepositories.users.findById(authorId);
    const enrichedPost = {
      ...newPost,
      author: {
        name: authorProfile?.profile.name || authorId,
        avatar: authorProfile?.profile.avatar || '',
      }
    };

    return NextResponse.json(enrichedPost, { status: 201 });
  } catch (error) {
    console.error("API Error POST /api/social:", error);
    return NextResponse.json({ error: 'Erro interno ao criar post.' }, { status: 500 });
  }
}
