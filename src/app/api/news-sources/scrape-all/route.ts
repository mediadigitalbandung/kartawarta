/**
 * POST /api/news-sources/scrape-all
 *
 * Scrape articles from ALL active news sources in batch.
 *
 * Body (optional):
 *   { "limitPerSource": 1..5, "autoPublish": boolean }
 *
 * Protected by SCRAPER_ROLES (SUPER_ADMIN → CONTRIBUTOR).
 * Filters to sources owned by user (or all sources if SUPER_ADMIN).
 */

import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import {
  successResponse,
  errorResponse,
  requireRole,
  logAudit,
} from "@/lib/api-utils";
import { fetchListing } from "@/lib/scraper/fetch-listing";
import { crawlListings } from "@/lib/scraper/crawl-listings";
import { fetchArticle } from "@/lib/scraper/fetch-article";
import { paraphraseAndCreateDraft } from "@/lib/scraper/paraphrase";
import {
  claimUrl,
  finalizeClaim,
  releaseClaim,
  getClaimsForUrls,
} from "@/lib/scraper/claim";
import { SCRAPER_ROLES } from "@/lib/roles";

const bodySchema = z.object({
  limitPerSource: z.number().int().min(1).max(5).optional(),
  autoPublish: z.boolean().optional(),
});

export const dynamic = "force-dynamic";
export const maxDuration = 300;

export async function POST(request: NextRequest) {
  const started = Date.now();
  try {
    const session = await requireRole([...SCRAPER_ROLES]);
    const isSuperAdmin = session.user.role === "SUPER_ADMIN";

    const parsedBody = await request
      .json()
      .then((b) => bodySchema.parse(b))
      .catch(() => ({} as z.infer<typeof bodySchema>));

    const limitPerSource = parsedBody.limitPerSource ?? 2;

    // Check system setting for auto publish if not explicitly provided in body
    let autoPublish = parsedBody.autoPublish;
    if (autoPublish === undefined) {
      const autoPublishRow = await prisma.systemSetting.findUnique({
        where: { key: "auto_publish_enabled" },
      });
      autoPublish = autoPublishRow?.value === "true";
    }

    // Find active sources accessible by operator
    const sources = await prisma.newsSource.findMany({
      where: {
        isActive: true,
        ...(isSuperAdmin ? {} : { OR: [{ ownerId: session.user.id }, { ownerId: null }] }),
      },
      orderBy: [{ priority: "desc" }, { lastCheckedAt: "asc" }],
      include: { owner: { select: { id: true, name: true } } },
    });

    if (sources.length === 0) {
      return successResponse({
        message: "Tidak ada sumber berita aktif yang dapat di-scrape.",
        totalSources: 0,
        totalCreated: 0,
        sources: [],
        durationMs: Date.now() - started,
      });
    }

    type SourceSummary = {
      sourceId: string;
      sourceName: string;
      attempted: number;
      ok: number;
      failed: number;
      skipped: number;
      error?: string;
    };

    const summaries: SourceSummary[] = [];
    let grandTotalOk = 0;
    let grandTotalPublished = 0;
    let grandTotalDrafts = 0;

    const operatorId = session.user.id;
    const operatorName = session.user.name;

    for (const source of sources) {
      const summary: SourceSummary = {
        sourceId: source.id,
        sourceName: source.name,
        attempted: 0,
        ok: 0,
        failed: 0,
        skipped: 0,
      };

      try {
        let categoryId = source.categoryId;
        if (!categoryId) {
          const fallback = await prisma.category.findFirst({
            orderBy: { order: "asc" },
            select: { id: true },
          });
          categoryId = fallback?.id ?? null;
        }
        if (!categoryId) {
          summary.error = "Tidak ada kategori";
          summaries.push(summary);
          continue;
        }

        const baseOpts = {
          articleSelector: source.articleSelector || undefined,
          titleSelector: source.titleSelector || undefined,
          imageSelector: source.imageSelector || undefined,
          useHeadless: source.useHeadless,
          waitForSelector: source.waitForSelector,
        };

        const wantsMultiPage =
          source.crawlSubcategories || (source.paginationMaxPages ?? 1) > 1;
        const listing = wantsMultiPage
          ? await crawlListings(source.listingUrl, {
              ...baseOpts,
              crawlMaxPages: source.crawlMaxPages,
              paginationMaxPages: source.paginationMaxPages,
              paginationPattern: source.paginationPattern,
            })
          : await fetchListing(source.listingUrl, baseOpts);

        const scrapedSet = new Set(source.scrapedUrls);
        const globalClaims = await getClaimsForUrls(
          listing.items.map((i) => i.url),
        );
        const newCandidates = listing.items.filter(
          (i) => !scrapedSet.has(i.url) && !globalClaims.has(i.url),
        );

        const newlyScrapedUrls: string[] = [];

        for (const candidate of newCandidates.slice(0, limitPerSource)) {
          const claim = await claimUrl({
            url: candidate.url,
            sourceId: source.id,
            userId: operatorId,
          });

          if (!claim.ok) {
            summary.skipped++;
            continue;
          }

          summary.attempted++;

          try {
            const detail = await fetchArticle(candidate.url, {
              contentSelector: source.contentSelector || undefined,
              imageSelector: source.imageSelector || undefined,
              useHeadless: source.useHeadless,
            });

            const draft = await paraphraseAndCreateDraft({
              source: detail,
              sourceName: source.name,
              authorId: operatorId,
              authorName: operatorName,
              categoryId,
              defaultTags: source.defaultTags,
              downloadImage: true,
              autoPublish,
            });

            await finalizeClaim(claim.claimId, claim.claimToken, draft.articleId);
            summary.ok++;
            grandTotalOk++;
            if (autoPublish) {
              grandTotalPublished++;
            } else {
              grandTotalDrafts++;
            }
            newlyScrapedUrls.push(candidate.url);
          } catch (err) {
            await releaseClaim(claim.claimId, claim.claimToken);
            summary.failed++;
          }
        }

        await prisma.newsSource.update({
          where: { id: source.id },
          data: {
            scrapedUrls: { push: newlyScrapedUrls },
            totalScraped: { increment: summary.ok },
            lastCheckedAt: new Date(),
            ...(summary.ok > 0
              ? { lastSuccessAt: new Date(), lastError: null }
              : {}),
          },
        });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        summary.error = msg;
        await prisma.newsSource.update({
          where: { id: source.id },
          data: {
            lastCheckedAt: new Date(),
            lastError: msg.slice(0, 500),
          },
        });
      }

      summaries.push(summary);
    }

    try {
      await logAudit(
        session.user.id,
        "NEWS_SOURCES_SCRAPE_ALL",
        "news_source",
        "bulk",
        JSON.stringify({
          totalSourcesProcessed: sources.length,
          totalArticlesCreated: grandTotalOk,
          autoPublish,
          durationMs: Date.now() - started,
        }),
      );
    } catch {
      // swallow
    }

    return successResponse({
      totalSourcesProcessed: sources.length,
      totalArticlesCreated: grandTotalOk,
      publishedCount: grandTotalPublished,
      draftCount: grandTotalDrafts,
      autoPublish,
      sources: summaries,
      durationMs: Date.now() - started,
    });
  } catch (error) {
    return errorResponse(error);
  }
}
