import { NextRequest, NextResponse } from "next/server";
import { forumService } from "@/lib/core/services/class/forum.service";
import { CreatePostPayloadSchema } from "@/lib/core/types/forum.type";
import { globalRepositories } from "@/lib/core/repositories";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const classId = searchParams.get("classId");
    if (!classId) {
      return NextResponse.json({ error: "classId é obrigatório" }, { status: 400 });
    }

    const posts = await forumService.list(classId);
    const enrichedPostPromises = posts.map(async (post) => {
      const authorProfile = await globalRepositories.users.findById(post.authorId);
      return {
        ...post,
        author: {
          name: authorProfile?.profile.name || 'Desconhecido',
          avatar: authorProfile?.profile.avatar || '',
        }
      };
    });

    const enrichedPosts = await Promise.all(enrichedPostPromises);
    return NextResponse.json(enrichedPosts);
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? "Erro ao listar fórum" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const validation = CreatePostPayloadSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: "Dados inválidos", details: validation.error.format() }, { status: 400 });
    }

    const { classId, ...postData } = validation.data;

    const created = await forumService.createPost(classId, {
      ...postData,
      isPinned: false,
      isAnswered: false,
    });

    const authorProfile = await globalRepositories.users.findById(created.authorId);
    const enrichedPost = {
      ...created,
      author: {
        id: created.authorId,
        name: authorProfile?.profile.name || created.authorId,
        avatar: authorProfile?.profile.avatar || ''
      }
    };

    return NextResponse.json(enrichedPost, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message ?? "Erro ao criar post" }, { status: 500 });
  }
}
