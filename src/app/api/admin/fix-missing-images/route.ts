/**
 * POST /api/admin/fix-missing-images
 *
 * Batch-fix endpoint: Finds all articles with missing featured images (`featuredImage` is null/empty),
 * generates or fetches high-resolution relevant news illustration photos for each,
 * downloads them to `/uploads`, registers them in `Media`, and updates the article!
 *
 * Auth: SUPER_ADMIN / ADMIN
 */

import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole, successResponse, errorResponse } from "@/lib/api-utils";
import { generateOrFetchFallbackImage } from "@/lib/scraper/fallback-image";
import { ADMIN_ROLES } from "@/lib/roles";

export const dynamic = "force-dynamic";
export const maxDuration = 180;

export async function POST(req: NextRequest) {
  try {
    const session = await requireRole([...ADMIN_ROLES]);
    const raw = await req.json().catch(() => ({}));
    const apply = raw?.apply === true;

    // Find all articles without a featured image
    const missingArticles = await prisma.article.findMany({
      where: {
        OR: [{ featuredImage: null }, { featuredImage: "" }],
      },
      select: {
        id: true,
        title: true,
        slug: true,
        category: { select: { name: true } },
      },
      take: 50,
    });

    if (!apply) {
      return successResponse({
        scanned: missingArticles.length,
        missingCount: missingArticles.length,
        samples: missingArticles.slice(0, 5).map((a) => ({ title: a.title, slug: a.slug })),
      });
    }

    let fixedCount = 0;
    for (const article of missingArticles) {
      try {
        const imageUrl = await generateOrFetchFallbackImage({
          title: article.title,
          categoryName: article.category?.name,
          authorId: session.user.id,
          authorName: session.user.name || "Editor",
        });

        if (imageUrl) {
          await prisma.article.update({
            where: { id: article.id },
            data: { featuredImage: imageUrl },
          });
          fixedCount++;
        }
      } catch {
        // continue to next article
      }
    }

    return successResponse({
      scanned: missingArticles.length,
      fixed: fixedCount,
    });
  } catch (err) {
    return errorResponse(err);
  }
}
