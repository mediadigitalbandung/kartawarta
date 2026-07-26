/**
 * POST/GET /api/cron/auto-article
 *
 * Cron endpoint & Admin Trigger: produce auto-generated article drafts per chosen
 * TargetKeyword using Qwen / Local AI / callAI (Claude/DeepSeek).
 * Protected by `Authorization: Bearer ${CRON_SECRET}` or SUPER_ADMIN session.
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";
import { sanitizeHtml } from "@/lib/sanitize";
import { cleanArticleContent } from "@/lib/scraper/clean-content";
import { verifyCronSecret, errorResponse, logAudit, getSession, ApiError } from "@/lib/api-utils";
import { trackCron } from "@/lib/cron-tracker";
import { tryAdvisoryLock, releaseAdvisoryLock } from "@/lib/cron-lock";
import { extractFirstImageUrl } from "@/lib/image-extract";
import { callLocalAI, getLocalAiConfig, isLocalAiReady } from "@/lib/local-ai";
import { callAI } from "@/lib/ai-client";
import { onArticlePublished } from "@/lib/seo-auto";
import * as Sentry from "@sentry/nextjs";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

async function uniqueSlug(base: string): Promise<string> {
  const root = slugify(base).slice(0, 90) || "artikel";
  const existing = await prisma.article.findUnique({
    where: { slug: root },
    select: { id: true },
  });
  if (!existing) return root;
  const suffix = Math.random().toString(36).slice(2, 8);
  return `${root}-${suffix}`;
}

async function readSetting(key: string, fallback: string): Promise<string> {
  try {
    const row = await prisma.systemSetting.findUnique({ where: { key } });
    if (!row || !row.value) return fallback;
    return row.value;
  } catch {
    return fallback;
  }
}

async function writeSetting(key: string, value: string): Promise<void> {
  try {
    await prisma.systemSetting.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });
  } catch {
    /* swallow */
  }
}

type GenerateResult =
  | { ok: true; articleId: string; slug: string; title: string; keyword: string; provider: string; tokens: number }
  | { ok: false; reason: string; keyword?: string };

interface GeneratedArticleData {
  title: string;
  excerpt: string;
  content: string;
  suggestedTags: string[];
  seoTitle: string;
  metaDescription: string;
}

async function generateOne(): Promise<GenerateResult> {
  // Pick keyword (random from top-10 active by priority).
  const keywords = await prisma.targetKeyword.findMany({
    where: { isActive: true },
    orderBy: { priority: "desc" },
    take: 10,
  });
  if (keywords.length === 0) {
    return { ok: false, reason: "no-active-keywords" };
  }
  const kw = keywords[Math.floor(Math.random() * keywords.length)];

  let gen: GeneratedArticleData | null = null;
  let usedProvider = "qwen";

  const userPrompt = `Anda jurnalis senior Kartawarta (media berita digital Bandung dengan fokus bisnis, ekonomi, pemerintahan, dan hukum, plus topik general lain).
Tulis sebuah artikel berita lengkap yang fresh, faktual, informatif, dan SEO-friendly tentang topik: "${kw.keyword}".

ATURAN WAJIB:
- Lead paragraf wajib menjawab 5W+1H.
- Hasil HTML rapi: <p>, <h2>, <ul>, <strong> seperlunya.
- DILARANG KERAS menyertakan tag gambar (<img>), foto tambahan, atau klausa/disclaimer AI di dalam isi artikel.

Format output WAJIB JSON valid (tanpa teks lain di luar JSON):
{
  "title": "judul Kartawarta fresh & menarik (50-80 karakter)",
  "excerpt": "ringkasan 130-160 karakter",
  "content": "body artikel HTML 500-800 kata, lead 5W+1H, paragraf rapi",
  "suggestedTags": ["tag1", "tag2", "tag3"]
}`;

  // 1. Try Local AI / Qwen if configured & ready
  const localConfig = await getLocalAiConfig();
  if (isLocalAiReady(localConfig)) {
    try {
      const localRes = await callLocalAI({
        systemPrompt: "Anda jurnalis senior Kartawarta. Jawab HANYA dengan JSON valid sesuai format yang diminta.",
        userPrompt,
        maxTokens: 2500,
        temperature: 0.65,
      });

      const jsonStr = localRes.text.trim().match(/\{[\s\S]*\}/)?.[0] || localRes.text;
      const parsed = JSON.parse(jsonStr);

      if (parsed && typeof parsed.title === "string" && typeof parsed.content === "string") {
        gen = {
          title: parsed.title,
          excerpt: parsed.excerpt || "",
          content: parsed.content,
          suggestedTags: Array.isArray(parsed.suggestedTags) ? parsed.suggestedTags : [],
          seoTitle: parsed.title.slice(0, 60),
          metaDescription: (parsed.excerpt || "").slice(0, 155),
        };
        usedProvider = `local-${localRes.model || "qwen"}`;
      }
    } catch (e) {
      console.warn(`[auto-article] Qwen / Local AI failed for "${kw.keyword}", falling back to callAI:`, e);
    }
  }

  // 2. Primary / Fallback: callAI (Claude / DeepSeek / Qwen API)
  if (!gen) {
    try {
      const aiRes = await callAI({
        feature: "article_draft",
        userPrompt,
        maxTokens: 2500,
        temperature: 0.65,
        forceProvider: "qwen",
      });

      const jsonStr = aiRes.text.trim().match(/\{[\s\S]*\}/)?.[0] || aiRes.text;
      const parsed = JSON.parse(jsonStr);

      if (parsed && typeof parsed.title === "string" && typeof parsed.content === "string") {
        gen = {
          title: parsed.title,
          excerpt: parsed.excerpt || "",
          content: parsed.content,
          suggestedTags: Array.isArray(parsed.suggestedTags) ? parsed.suggestedTags : [],
          seoTitle: parsed.title.slice(0, 60),
          metaDescription: (parsed.excerpt || "").slice(0, 155),
        };
        usedProvider = aiRes.provider || "ai";
      }
    } catch (e) {
      console.error(`[auto-article] AI draft generation failed for "${kw.keyword}":`, e);
    }
  }

  if (!gen) {
    return {
      ok: false,
      reason: `generation-failed (Qwen & callAI both failed)`,
      keyword: kw.keyword,
    };
  }

  // Validate output
  const plainLen = gen.content.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().length;
  if (!gen.title.trim() || plainLen < 150) {
    return {
      ok: false,
      reason: `output-too-short (title=${gen.title.trim() ? "y" : "n"}, len=${plainLen})`,
      keyword: kw.keyword,
    };
  }

  // Author resolution
  let authorId: string | null = null;
  const authorIdSetting = await readSetting("auto_article_author_id", "");
  if (authorIdSetting) {
    const exists = await prisma.user.findUnique({
      where: { id: authorIdSetting },
      select: { id: true },
    });
    if (exists) authorId = exists.id;
  }
  if (!authorId) {
    const admin = await prisma.user.findFirst({
      where: { role: "SUPER_ADMIN" },
      orderBy: { createdAt: "asc" },
      select: { id: true },
    });
    authorId = admin?.id ?? null;
  }
  if (!authorId) {
    return { ok: false, reason: "no-author-resolved", keyword: kw.keyword };
  }

  // Category resolution
  let categoryId = kw.categoryId;
  if (!categoryId) {
    const firstCat = await prisma.category.findFirst({
      orderBy: { order: "asc" },
      select: { id: true },
    });
    if (!firstCat) {
      return { ok: false, reason: "no-category-available", keyword: kw.keyword };
    }
    categoryId = firstCat.id;
  }

  // Auto Publish setting check
  const autoPublishStr = await readSetting("auto_article_auto_publish", "false");
  const isAutoPublish = autoPublishStr === "true";
  const status = isAutoPublish ? "PUBLISHED" : "DRAFT";
  const publishedAt = isAutoPublish ? new Date() : null;
  const verificationLabel = isAutoPublish ? "VERIFIED" : "UNVERIFIED";

  // Featured image
  const featuredImage = extractFirstImageUrl(gen.content) || null;

  // Clean content HTML (paraphrase text ONLY)
  const bodyHtml = cleanArticleContent(sanitizeHtml(gen.content));

  const slug = await uniqueSlug(gen.title);

  let article;
  try {
    article = await prisma.article.create({
      data: {
        title: gen.title.slice(0, 250),
        slug,
        content: bodyHtml,
        excerpt: gen.excerpt.slice(0, 500) || null,
        seoTitle: gen.seoTitle ? gen.seoTitle.slice(0, 70) : null,
        seoDescription: gen.metaDescription ? gen.metaDescription.slice(0, 160) : null,
        featuredImage,
        status,
        publishedAt,
        verificationLabel,
        isAutoGenerated: true,
        sourceArticleId: null,
        authorId,
        categoryId,
      },
      select: { id: true, slug: true, title: true, status: true },
    });
  } catch (e) {
    return { ok: false, reason: `db-create-failed: ${e instanceof Error ? e.message : String(e)}`, keyword: kw.keyword };
  }

  // Tags
  if (gen.suggestedTags.length > 0) {
    const tagsToConnect = gen.suggestedTags
      .filter((t) => t.trim().length > 0)
      .map((t) => ({ name: t.trim(), slug: slugify(t.trim()) }));

    if (tagsToConnect.length > 0) {
      await prisma.article
        .update({
          where: { id: article.id },
          data: {
            tags: {
              connectOrCreate: tagsToConnect.map((t) => ({
                where: { slug: t.slug },
                create: { name: t.name, slug: t.slug },
              })),
            },
          },
        })
        .catch(() => {});
    }
  }

  // Trigger SEO / Social / Cache indexing if auto-published
  if (isAutoPublish) {
    await onArticlePublished(article.slug, article.id).catch(() => {});
  }

  // Update keyword lastGeneratedAt
  try {
    await prisma.targetKeyword.update({
      where: { id: kw.id },
      data: { lastGeneratedAt: new Date() },
    });
  } catch {
    /* swallow */
  }

  try {
    await logAudit(
      null,
      "CRON_AUTO_ARTICLE",
      "article",
      article.id,
      JSON.stringify({
        keyword: kw.keyword,
        provider: usedProvider,
        status: article.status,
        tags: gen.suggestedTags.length,
      }),
    );
  } catch {
    /* swallow */
  }

  return {
    ok: true,
    articleId: article.id,
    slug: article.slug,
    title: article.title,
    keyword: kw.keyword,
    provider: usedProvider,
    tokens: 0,
  };
}

function parseInterval(raw: string): number {
  const n = Number(raw);
  if ([5, 10, 15, 20, 30, 60].includes(n)) return n;
  return 60;
}

function parseBatch(raw: string): number {
  const n = Math.floor(Number(raw));
  if (Number.isNaN(n)) return 1;
  if (n < 0) return 0;
  if (n > 3) return 3;
  return n;
}

async function handler(req: NextRequest) {
  const started = Date.now();
  const force = req.nextUrl.searchParams.get("force") === "true";

  try {
    // Auth: Allow CRON_SECRET or SUPER_ADMIN session
    let isAuthorized = false;
    try {
      verifyCronSecret(req);
      isAuthorized = true;
    } catch {
      const session = await getSession();
      if (session?.user?.role === "SUPER_ADMIN") {
        isAuthorized = true;
      }
    }

    if (!isAuthorized) {
      return errorResponse(new ApiError("Unauthorized", 401));
    }

    const LOCK_KEY = "cron:auto-article";
    const lockAcquired = await tryAdvisoryLock(LOCK_KEY);
    if (!lockAcquired) {
      return NextResponse.json(
        {
          success: false,
          skipped: true,
          reason: "ANOTHER_RUN_IN_PROGRESS",
          durationMs: Date.now() - started,
        },
        { status: 200 },
      );
    }

    try {
      const enabledStr = await readSetting("auto_article_enabled", "false");
      if (!force && enabledStr !== "true") {
        return NextResponse.json(
          { success: true, skipped: "disabled", durationMs: Date.now() - started },
          { status: 200 },
        );
      }

      const intervalMin = parseInterval(await readSetting("auto_article_interval_minutes", "60"));
      let batchSize = parseBatch(await readSetting("auto_article_batch_size", "1"));
      if (force && batchSize === 0) batchSize = 1;

      const lastRunIso = await readSetting("auto_article_last_run_at", "");
      const lastRunAt = lastRunIso ? new Date(lastRunIso) : null;
      const now = new Date();

      if (!force && lastRunAt && !Number.isNaN(lastRunAt.getTime())) {
        const elapsedMin = (now.getTime() - lastRunAt.getTime()) / 60000;
        if (elapsedMin < intervalMin) {
          return NextResponse.json(
            {
              success: true,
              skipped: "throttled",
              intervalMinutes: intervalMin,
              elapsedMinutes: Math.round(elapsedMin * 10) / 10,
              nextRunIn: Math.round((intervalMin - elapsedMin) * 10) / 10,
              durationMs: Date.now() - started,
            },
            { status: 200 },
          );
        }
      }

      await writeSetting("auto_article_last_run_at", now.toISOString());

      if (batchSize === 0) {
        return NextResponse.json(
          {
            success: true,
            skipped: "batch-size-zero",
            intervalMinutes: intervalMin,
            batchSize: 0,
            durationMs: Date.now() - started,
          },
          { status: 200 },
        );
      }

      const results: GenerateResult[] = [];
      for (let i = 0; i < batchSize; i++) {
        const r = await generateOne();
        results.push(r);
      }

      const created = results.filter((r) => r.ok);
      const skipped = results.filter((r) => !r.ok);

      return NextResponse.json(
        {
          success: true,
          intervalMinutes: intervalMin,
          batchSize,
          created: created.length,
          skipped: skipped.length,
          articles: created.map((r) => r.ok ? { id: r.articleId, slug: r.slug, title: r.title, keyword: r.keyword, provider: r.provider } : null).filter(Boolean),
          skips: skipped.map((r) => !r.ok ? { reason: r.reason, keyword: r.keyword } : null).filter(Boolean),
          durationMs: Date.now() - started,
        },
        { status: 200 },
      );
    } finally {
      await releaseAdvisoryLock(LOCK_KEY);
    }
  } catch (e) {
    Sentry.captureException(e, { tags: { cron: "auto-article" } });
    console.error("[cron auto-article] UNEXPECTED:", e);
    return NextResponse.json(
      {
        success: false,
        error: e instanceof Error ? e.message : String(e),
        durationMs: Date.now() - started,
      },
      { status: 500 },
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    return await trackCron("auto-article", () => handler(req));
  } catch (e) {
    return errorResponse(e);
  }
}

export async function POST(req: NextRequest) {
  try {
    return await trackCron("auto-article", () => handler(req));
  } catch (e) {
    return errorResponse(e);
  }
}
