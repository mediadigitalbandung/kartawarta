import { successResponse, errorResponse, requireRole } from "@/lib/api-utils";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireRole(["SUPER_ADMIN", "CHIEF_EDITOR"]);

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [
      totalViews,
      totalArticles,
      publishedArticles,
      totalComments,
      totalUsers,
      articlesToday,
      articlesWeek,
      articlesMonth,
      topArticles,
      topCategories,
      recentActivity,
      dailyStats,
    ] = await Promise.all([
      prisma.article.aggregate({ where: { status: "PUBLISHED" }, _sum: { viewCount: true } }),
      prisma.article.count(),
      prisma.article.count({ where: { status: "PUBLISHED" } }),
      prisma.comment.count(),
      prisma.user.count({ where: { isActive: true } }),
      prisma.article.count({ where: { status: "PUBLISHED", publishedAt: { gte: today } } }),
      prisma.article.count({ where: { status: "PUBLISHED", publishedAt: { gte: weekAgo } } }),
      prisma.article.count({ where: { status: "PUBLISHED", publishedAt: { gte: monthAgo } } }),
      // Top 10 articles by views
      prisma.article.findMany({
        where: { status: "PUBLISHED" },
        select: { title: true, slug: true, viewCount: true, publishedAt: true, category: { select: { name: true } } },
        orderBy: { viewCount: "desc" },
        take: 10,
      }),
      // Top categories by article count & views
      prisma.category.findMany({
        select: {
          name: true,
          slug: true,
          _count: { select: { articles: true } },
          articles: { where: { status: "PUBLISHED" }, select: { viewCount: true } },
        },
        orderBy: { order: "asc" },
      }),
      // Recent 10 published articles
      prisma.article.findMany({
        where: { status: "PUBLISHED" },
        select: { title: true, slug: true, viewCount: true, publishedAt: true, author: { select: { name: true } }, category: { select: { name: true } } },
        orderBy: { publishedAt: "desc" },
        take: 10,
      }),
      // Daily article count for last 14 days
      prisma.$queryRaw<{ date: Date; count: bigint }[]>`
        SELECT DATE("publishedAt") as date, COUNT(*) as count
        FROM articles
        WHERE status = 'PUBLISHED' AND "publishedAt" >= ${new Date(today.getTime() - 14 * 24 * 60 * 60 * 1000)}
        GROUP BY DATE("publishedAt")
        ORDER BY date ASC
      `,
    ]);

    // Process category stats
    const categoryStats = topCategories.map((c) => ({
      name: c.name,
      slug: c.slug,
      articles: c._count.articles,
      views: c.articles.reduce((sum, a) => sum + a.viewCount, 0),
    })).sort((a, b) => b.views - a.views);

    // Process daily stats for chart
    const dailyChart = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = d.toISOString().split("T")[0];
      const found = dailyStats.find((s) => new Date(s.date).toISOString().split("T")[0] === dateStr);
      dailyChart.push({
        date: d.toLocaleDateString("id-ID", { day: "numeric", month: "short" }),
        count: found ? Number(found.count) : 0,
      });
    }

    return successResponse({
      overview: {
        totalViews: totalViews._sum.viewCount || 0,
        totalArticles,
        publishedArticles,
        totalComments,
        totalUsers,
        articlesToday,
        articlesWeek,
        articlesMonth,
      },
      topArticles: topArticles.map((a) => ({
        title: a.title,
        slug: a.slug,
        views: a.viewCount,
        category: a.category.name,
        publishedAt: a.publishedAt,
      })),
      categoryStats,
      recentActivity: recentActivity.map((a) => ({
        title: a.title,
        slug: a.slug,
        views: a.viewCount,
        author: a.author.name,
        category: a.category.name,
        publishedAt: a.publishedAt,
      })),
      dailyChart,
    });
  } catch (error) {
    return errorResponse(error);
  }
}
