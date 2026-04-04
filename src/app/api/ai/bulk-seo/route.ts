import { NextRequest } from "next/server";
import { requireRole, successResponse, errorResponse, ApiError } from "@/lib/api-utils";
import { prisma } from "@/lib/prisma";
import { generateSeoTitle, generateSeoDescription } from "@/lib/seo-auto";

export const dynamic = "force-dynamic";

/** POST: Bulk generate SEO fields for articles missing them */
export async function POST(req: NextRequest) {
  try {
    await requireRole(["SUPER_ADMIN", "CHIEF_EDITOR"]);

    const body = await req.json();
    const { mode, articleIds } = body as { mode: "all" | "selected" | "ai"; articleIds?: string[] };

    // Find articles missing SEO fields
    const where: Record<string, unknown> = {
      status: "PUBLISHED",
      OR: [
        { seoTitle: null },
        { seoTitle: "" },
        { seoDescription: null },
        { seoDescription: "" },
      ],
    };

    if (mode === "selected" && articleIds?.length) {
      where.id = { in: articleIds };
    }

    const articles = await prisma.article.findMany({
      where,
      select: { id: true, title: true, excerpt: true, content: true, seoTitle: true, seoDescription: true },
      take: 100, // max 100 at a time
    });

    if (articles.length === 0) {
      return successResponse({ processed: 0, message: "Semua artikel sudah memiliki SEO Title dan Meta Description" });
    }

    if (mode === "ai") {
      // AI-powered generation via DeepSeek
      const setting = await prisma.systemSetting.findUnique({ where: { key: "deepseek_api_key" } });
      if (!setting?.value) {
        throw new ApiError("API Key AI belum dikonfigurasi di Pengaturan.", 400);
      }

      let processed = 0;
      for (const article of articles.slice(0, 20)) { // limit AI to 20 articles per batch
        try {
          const updates: Record<string, string> = {};

          if (!article.seoTitle) {
            const seoTitle = await callAI(setting.value, "seo_title", article.title, article.content);
            if (seoTitle) updates.seoTitle = seoTitle.slice(0, 70);
          }
          if (!article.seoDescription) {
            const desc = await callAI(setting.value, "meta_description", article.title, article.content);
            if (desc) updates.seoDescription = desc.slice(0, 160);
          }

          if (Object.keys(updates).length > 0) {
            await prisma.article.update({ where: { id: article.id }, data: updates });
            processed++;
          }
        } catch {
          // Skip failed articles, continue with rest
        }
      }

      return successResponse({ processed, total: articles.length, message: `${processed} artikel berhasil di-generate dengan AI` });
    }

    // Auto-generate (non-AI) — use simple extraction
    let processed = 0;
    for (const article of articles) {
      const updates: Record<string, string> = {};
      if (!article.seoTitle) updates.seoTitle = generateSeoTitle(article.title);
      if (!article.seoDescription) updates.seoDescription = generateSeoDescription(article.excerpt, article.content);

      if (Object.keys(updates).length > 0) {
        await prisma.article.update({ where: { id: article.id }, data: updates });
        processed++;
      }
    }

    return successResponse({ processed, total: articles.length, message: `${processed} artikel berhasil di-generate` });
  } catch (error) {
    return errorResponse(error);
  }
}

async function callAI(apiKey: string, feature: string, title: string, content: string): Promise<string> {
  const prompts: Record<string, string> = {
    seo_title: `Buatkan SEO title (maks 60 karakter) untuk artikel berita berikut. Hanya output title saja, tanpa tanda kutip. Judul: ${title}`,
    meta_description: `Buatkan meta description (maks 155 karakter) untuk artikel berita berikut. Hanya output deskripsi saja, tanpa tanda kutip. Judul: ${title}. Konten: ${content.replace(/<[^>]+>/g, " ").slice(0, 800)}`,
  };

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  try {
    const res = await fetch("https://api.deepseek.com/v1/chat/completions", {
      method: "POST",
      signal: controller.signal,
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          { role: "system", content: "Kamu adalah asisten SEO untuk media berita Indonesia. Jawab singkat dan langsung." },
          { role: "user", content: prompts[feature] },
        ],
        max_tokens: 100,
        temperature: 0.5,
      }),
    });
    const data = await res.json();
    return data.choices?.[0]?.message?.content?.trim().replace(/^["']|["']$/g, "") || "";
  } finally {
    clearTimeout(timeout);
  }
}
