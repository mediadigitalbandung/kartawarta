import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// GET /api/search/suggest?q=keyword — returns top 5 matching article titles
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "";

    if (query.length < 2) {
      return NextResponse.json({ success: true, data: [] });
    }

    const articles = await prisma.article.findMany({
      where: {
        status: "PUBLISHED",
        title: { contains: query, mode: "insensitive" },
      },
      select: {
        title: true,
        slug: true,
      },
      orderBy: { publishedAt: "desc" },
      take: 5,
    });

    return NextResponse.json({ success: true, data: articles });
  } catch {
    return NextResponse.json(
      { success: false, error: "Gagal mengambil saran pencarian" },
      { status: 500 }
    );
  }
}
