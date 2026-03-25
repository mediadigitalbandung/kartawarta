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
import { calculateReadTime } from "@/lib/utils";
import { canApproveArticles, canPublishDirectly } from "@/lib/auth";

const updateArticleSchema = z.object({
  title: z.string().min(5).max(255).optional(),
  content: z.string().min(50).optional(),
  excerpt: z.string().max(500).optional(),
  featuredImage: z.string().url().optional().nullable(),
  categoryId: z.string().optional(),
  seoTitle: z.string().max(70).optional(),
  seoDescription: z.string().max(160).optional(),
  status: z.enum(["DRAFT", "IN_REVIEW", "APPROVED", "PUBLISHED", "REJECTED", "ARCHIVED"]).optional(),
  verificationLabel: z.enum(["VERIFIED", "UNVERIFIED", "CORRECTION", "OPINION"]).optional(),
  scheduledAt: z.string().datetime().optional().nullable(),
});

// GET /api/articles/:id
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const article = await prisma.article.findUnique({
      where: { id: params.id },
      include: {
        author: { select: { id: true, name: true, avatar: true, bio: true } },
        category: { select: { id: true, name: true, slug: true } },
        tags: { select: { id: true, name: true, slug: true } },
        sources: true,
        corrections: { orderBy: { createdAt: "desc" } },
        revisions: { orderBy: { createdAt: "desc" }, take: 10 },
      },
    });

    if (!article) {
      throw new ApiError("Artikel tidak ditemukan", 404);
    }

    // Increment view count for published articles
    if (article.status === "PUBLISHED") {
      await prisma.article.update({
        where: { id: params.id },
        data: { viewCount: { increment: 1 } },
      });
    }

    return successResponse(article);
  } catch (error) {
    return errorResponse(error);
  }
}

// PUT /api/articles/:id
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAuth();
    const article = await prisma.article.findUnique({
      where: { id: params.id },
      include: { sources: true },
    });

    if (!article) {
      throw new ApiError("Artikel tidak ditemukan", 404);
    }

    // Check permission
    const isOwner = article.authorId === session.user.id;
    const isEditor = canApproveArticles(session.user.role);

    if (!isOwner && !isEditor) {
      throw new ApiError("Tidak memiliki akses untuk mengedit artikel ini", 403);
    }

    const body = await request.json();
    const data = updateArticleSchema.parse(body);

    // Handle status changes
    if (data.status) {
      if (
        ["APPROVED", "REJECTED"].includes(data.status) &&
        !isEditor
      ) {
        throw new ApiError("Hanya editor yang dapat approve/reject artikel", 403);
      }
      if (
        data.status === "PUBLISHED" &&
        !canPublishDirectly(session.user.role)
      ) {
        throw new ApiError("Tidak memiliki akses untuk publish langsung", 403);
      }
    }

    // Save revision if content changed
    if (data.content && data.content !== article.content) {
      await prisma.revision.create({
        data: {
          articleId: article.id,
          content: article.content,
          title: article.title,
          changedBy: session.user.name || session.user.email,
        },
      });
    }

    const readTime = data.content
      ? calculateReadTime(data.content)
      : undefined;

    const updated = await prisma.article.update({
      where: { id: params.id },
      data: {
        ...data,
        readTime,
        publishedAt:
          data.status === "PUBLISHED" && !article.publishedAt
            ? new Date()
            : undefined,
        scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : undefined,
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
      "UPDATE",
      "article",
      article.id,
      `${data.status ? `Status → ${data.status}. ` : ""}Mengedit artikel: ${article.title}`
    );

    return successResponse(updated);
  } catch (error) {
    return errorResponse(error);
  }
}

// DELETE /api/articles/:id
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAuth();
    const article = await prisma.article.findUnique({
      where: { id: params.id },
    });

    if (!article) {
      throw new ApiError("Artikel tidak ditemukan", 404);
    }

    const isOwner = article.authorId === session.user.id;
    const isAdmin = session.user.role === "SUPER_ADMIN";

    if (!isOwner && !isAdmin) {
      throw new ApiError("Tidak memiliki akses untuk menghapus artikel ini", 403);
    }

    await prisma.article.delete({ where: { id: params.id } });

    await logAudit(
      session.user.id,
      "DELETE",
      "article",
      params.id,
      `Menghapus artikel: ${article.title}`
    );

    return successResponse({ deleted: true });
  } catch (error) {
    return errorResponse(error);
  }
}
