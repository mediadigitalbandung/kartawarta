import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole, successResponse, errorResponse } from "@/lib/api-utils";

export const dynamic = "force-dynamic";

/**
 * GET /api/news-sources/scrape-progress
 * Returns real-time scraping & AI paraphrasing progress for the panel dashboard tab.
 */
export async function GET(req: NextRequest) {
  try {
    await requireRole(["SUPER_ADMIN", "CHIEF_EDITOR", "EDITOR", "CONTRIBUTOR"]);

    const { searchParams } = new URL(req.url);
    const filterStatus = searchParams.get("status") || "all";

    const where: Record<string, unknown> = {};
    if (filterStatus === "CLAIMED") where.status = "CLAIMED";
    if (filterStatus === "DONE") where.status = "DONE";

    const [scrapedUrls, totalCompleted, totalInProgress, activeSourcesCount] = await Promise.all([
      prisma.scrapedUrl.findMany({
        where,
        orderBy: { updatedAt: "desc" },
        take: 50,
        include: {
          source: { select: { id: true, name: true } },
          scrapedBy: { select: { name: true } },
        },
      }),
      prisma.scrapedUrl.count({ where: { status: "DONE" } }),
      prisma.scrapedUrl.count({ where: { status: "CLAIMED" } }),
      prisma.newsSource.count({ where: { isActive: true } }),
    ]);

    // Fetch related articles for DONE items
    const articleIds = scrapedUrls
      .map((s) => s.articleId)
      .filter((id): id is string => Boolean(id));

    const articles =
      articleIds.length > 0
        ? await prisma.article.findMany({
            where: { id: { in: articleIds } },
            select: {
              id: true,
              title: true,
              slug: true,
              status: true,
              featuredImage: true,
              publishedAt: true,
            },
          })
        : [];

    const articleMap = new Map(articles.map((a) => [a.id, a]));

    const items = scrapedUrls.map((item) => {
      const article = item.articleId ? articleMap.get(item.articleId) : null;
      const isDone = item.status === "DONE";
      const isClaimed = item.status === "CLAIMED";

      // Calculate dynamic progress percent for in-progress claims based on elapsed time
      let progressPercent = isDone ? 100 : 0;
      let stepMessage = "Selesai diproses & diterbitkan";

      if (isClaimed) {
        const elapsedSec = Math.floor((Date.now() - new Date(item.claimedAt).getTime()) / 1000);
        if (elapsedSec < 5) {
          progressPercent = 25;
          stepMessage = "Mengambil HTML & ekstraksi teks sumber...";
        } else if (elapsedSec < 15) {
          progressPercent = 55;
          stepMessage = "Mengambil foto asli & menyaring elemen...";
        } else if (elapsedSec < 35) {
          progressPercent = 80;
          stepMessage = "Paraphrase AI (Qwen Jurnalistik 5W1H)...";
        } else {
          progressPercent = 95;
          stepMessage = "Menyimpan & mempublikasikan artikel...";
        }
      }

      return {
        id: item.id,
        url: item.url,
        status: item.status,
        sourceName: item.source?.name || "Sumber Berita",
        scrapedBy: item.scrapedBy?.name || "System Scraper",
        claimedAt: item.claimedAt,
        updatedAt: item.updatedAt,
        progressPercent,
        stepMessage,
        article: article
          ? {
              id: article.id,
              title: article.title,
              slug: article.slug,
              status: article.status,
              featuredImage: article.featuredImage,
              publishedAt: article.publishedAt,
            }
          : null,
      };
    });

    return successResponse({
      summary: {
        totalCompleted,
        totalInProgress,
        activeSourcesCount,
      },
      items,
    });
  } catch (err) {
    return errorResponse(err);
  }
}
