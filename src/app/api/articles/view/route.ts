import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isBotOrPrefetch } from "@/lib/bot-detection";

export const dynamic = "force-dynamic";

/**
 * POST /api/articles/view
 * High-accuracy, bot-filtered, deduplicated pageview endpoint for articles.
 *
 * Checks User-Agent & prefetch headers. If valid human browser request,
 * increments Article.viewCount atomically.
 */
export async function POST(req: NextRequest) {
  try {
    const userAgent = req.headers.get("user-agent");

    // Guard against search engine bots, crawlers, and link prefetches
    if (isBotOrPrefetch(userAgent, req.headers)) {
      return NextResponse.json({ success: true, counted: false, reason: "bot-or-prefetch" }, { status: 200 });
    }

    let articleId = "";
    try {
      const body = await req.json();
      articleId = (body?.articleId || "").trim();
    } catch {
      return NextResponse.json({ success: false, error: "Invalid JSON body" }, { status: 400 });
    }

    if (!articleId) {
      return NextResponse.json({ success: false, error: "articleId is required" }, { status: 400 });
    }

    // Verify article exists and is published
    const article = await prisma.article.findUnique({
      where: { id: articleId },
      select: { id: true, status: true },
    });

    if (!article || article.status !== "PUBLISHED") {
      return NextResponse.json({ success: true, counted: false, reason: "not-published" }, { status: 200 });
    }

    // Atomically increment view count for real human view
    await prisma.article.update({
      where: { id: articleId },
      data: { viewCount: { increment: 1 } },
    });

    return NextResponse.json({ success: true, counted: true }, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    );
  }
}
