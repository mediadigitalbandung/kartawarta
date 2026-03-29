import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/api-utils";

// POST /api/articles/by-slugs — fetch articles by slugs array (for bookmarks)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const slugs: string[] = body.slugs || [];

    if (!Array.isArray(slugs) || slugs.length === 0) {
      return successResponse([]);
    }

    // Limit to 50 slugs max
    const limitedSlugs = slugs.slice(0, 50);

    const articles = await prisma.article.findMany({
      where: {
        slug: { in: limitedSlugs },
        status: "PUBLISHED",
      },
      include: {
        author: { select: { name: true } },
        category: { select: { name: true, slug: true } },
      },
      orderBy: { publishedAt: "desc" },
    });

    return successResponse(articles);
  } catch (error) {
    return errorResponse(error);
  }
}
