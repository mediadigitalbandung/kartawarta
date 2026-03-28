import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import {
  successResponse,
  errorResponse,
  requireAuth,
  logAudit,
  ApiError,
} from "@/lib/api-utils";
import { slugify, calculateReadTime } from "@/lib/utils";
import { canWriteArticles, canPublishDirectly, canApproveArticles } from "@/lib/auth";

const createArticleSchema = z.object({
  title: z.string().min(5, "Judul minimal 5 karakter").max(255),
  content: z.string().min(50, "Konten minimal 50 karakter"),
  excerpt: z.string().max(500).optional(),
  featuredImage: z.string().url().optional().nullable(),
  categoryId: z.string().min(1, "Kategori wajib dipilih"),
  tags: z.array(z.string()).optional(),
  seoTitle: z.string().max(70).optional(),
  seoDescription: z.string().max(160).optional(),
  status: z.enum(["DRAFT", "IN_REVIEW", "PUBLISHED"]).optional(),
  verificationLabel: z.enum(["VERIFIED", "UNVERIFIED", "CORRECTION", "OPINION"]).optional(),
  sources: z
    .array(
      z.object({
        name: z.string().min(1),
        title: z.string().optional(),
        institution: z.string().optional(),
        url: z.string().url().optional(),
      })
    )
    .optional(),
  scheduledAt: z.string().datetime().optional().nullable(),
});

// GET /api/articles — list articles (public)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");
    const category = searchParams.get("category");
    const status = searchParams.get("status") || "PUBLISHED";
    const authorId = searchParams.get("authorId");
    const reviewedBy = searchParams.get("reviewedBy");
    const sort = searchParams.get("sort") || "publishedAt";

    const where: Record<string, unknown> = {};

    if (status === "ALL") {
      // Fetch all statuses — requires auth (admin panel)
      const session = await requireAuth();
      // Non-editor roles can only see their own articles
      if (!canApproveArticles(session.user.role)) {
        where.authorId = session.user.id;
      }
      // No status filter — return all
    } else if (status === "PUBLISHED") {
      where.status = "PUBLISHED";
    } else {
      // Non-public statuses require auth
      const session = await requireAuth();
      // Non-editor roles can only see their own articles
      if (!canApproveArticles(session.user.role)) {
        where.authorId = session.user.id;
      }
      where.status = status;
    }

    if (category) {
      where.category = { slug: category };
    }
    if (authorId) {
      where.authorId = authorId;
    }
    if (reviewedBy) {
      where.reviewedBy = reviewedBy;
    }

    const orderBy: Record<string, string> =
      sort === "views"
        ? { viewCount: "desc" }
        : sort === "oldest"
          ? { publishedAt: "asc" }
          : { publishedAt: "desc" };

    const [articles, total] = await Promise.all([
      prisma.article.findMany({
        where,
        include: {
          author: { select: { id: true, name: true, avatar: true } },
          category: { select: { id: true, name: true, slug: true } },
          tags: { select: { id: true, name: true, slug: true } },
        },
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.article.count({ where }),
    ]);

    return successResponse({
      articles,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return errorResponse(error);
  }
}

// POST /api/articles — create article
export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();

    if (!canWriteArticles(session.user.role)) {
      throw new ApiError("Tidak memiliki akses untuk membuat artikel", 403);
    }

    const body = await request.json();
    const data = createArticleSchema.parse(body);

    // Generate slug
    let slug = slugify(data.title);
    const existingSlug = await prisma.article.findUnique({ where: { slug } });
    if (existingSlug) {
      slug = `${slug}-${Date.now().toString(36)}`;
    }

    // Determine status
    let finalStatus = data.status || "DRAFT";
    if (finalStatus === "PUBLISHED" && !canPublishDirectly(session.user.role)) {
      finalStatus = "IN_REVIEW";
    }

    // Calculate read time
    const readTime = calculateReadTime(data.content);

    // Handle tags
    const tagConnections = [];
    if (data.tags && data.tags.length > 0) {
      for (const tagName of data.tags) {
        const tagSlug = slugify(tagName);
        const tag = await prisma.tag.upsert({
          where: { slug: tagSlug },
          update: {},
          create: { name: tagName, slug: tagSlug },
        });
        tagConnections.push({ id: tag.id });
      }
    }

    const article = await prisma.article.create({
      data: {
        title: data.title,
        slug,
        content: data.content,
        excerpt: data.excerpt || data.content.replace(/<[^>]*>/g, "").slice(0, 200),
        featuredImage: data.featuredImage,
        status: finalStatus as "DRAFT" | "IN_REVIEW" | "PUBLISHED",
        verificationLabel: data.verificationLabel || "UNVERIFIED",
        readTime,
        authorId: session.user.id,
        categoryId: data.categoryId,
        seoTitle: data.seoTitle || data.title,
        seoDescription: data.seoDescription || data.content.replace(/<[^>]*>/g, "").slice(0, 160),
        publishedAt: finalStatus === "PUBLISHED" ? new Date() : null,
        scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : null,
        tags: { connect: tagConnections },
        sources: data.sources
          ? { create: data.sources }
          : undefined,
      },
      include: {
        author: { select: { id: true, name: true } },
        category: { select: { id: true, name: true, slug: true } },
        tags: true,
        sources: true,
      },
    });

    await logAudit(
      session.user.id,
      "CREATE",
      "article",
      article.id,
      `Membuat artikel: ${article.title}`
    );

    return successResponse(article, 201);
  } catch (error) {
    return errorResponse(error);
  }
}
