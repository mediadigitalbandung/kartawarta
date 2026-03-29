import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  successResponse,
  errorResponse,
  requireAuth,
  ApiError,
} from "@/lib/api-utils";

// GET /api/articles/:id/revisions
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAuth();

    const article = await prisma.article.findUnique({
      where: { id: params.id },
      select: { id: true },
    });

    if (!article) {
      throw new ApiError("Artikel tidak ditemukan", 404);
    }

    const revisions = await prisma.revision.findMany({
      where: { articleId: params.id },
      orderBy: { createdAt: "desc" },
    });

    return successResponse(revisions);
  } catch (error) {
    return errorResponse(error);
  }
}
