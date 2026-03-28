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
import { canApproveArticles } from "@/lib/auth";

const updateArticleSchema = z.object({
  title: z.string().min(5).max(255).optional(),
  content: z.string().min(50).optional(),
  excerpt: z.string().max(500).optional(),
  featuredImage: z.string().url().optional().nullable(),
  categoryId: z.string().optional(),
  seoTitle: z.string().max(70).optional(),
  seoDescription: z.string().max(160).optional(),
  status: z.enum(["DRAFT", "IN_REVIEW", "APPROVED", "PUBLISHED", "REJECTED", "ARCHIVED"]).optional(),
  scheduledAt: z.string().datetime().optional().nullable(),
  reviewNote: z.string().max(1000).optional().nullable(),
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

    // Resolve reviewer name
    let reviewerName: string | null = null;
    if (article.reviewedBy) {
      const reviewer = await prisma.user.findUnique({
        where: { id: article.reviewedBy },
        select: { name: true },
      });
      reviewerName = reviewer?.name || null;
    }

    // Increment view count for published articles
    if (article.status === "PUBLISHED") {
      await prisma.article.update({
        where: { id: params.id },
        data: { viewCount: { increment: 1 } },
      });
    }

    return successResponse({ ...article, reviewerName });
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

    const isOwner = article.authorId === session.user.id;
    const isEditor = canApproveArticles(session.user.role);
    const isAdmin = session.user.role === "SUPER_ADMIN" || session.user.role === "CHIEF_EDITOR";
    const isAssignedEditor = isEditor && article.reviewedBy === session.user.id;

    if (!isOwner && !isEditor) {
      throw new ApiError("Tidak memiliki akses untuk mengedit artikel ini", 403);
    }

    const body = await request.json();
    const { tags: tagNames, sources: sourcesData, reviewNote: bodyReviewNote, ...rawData } = body;
    const data = updateArticleSchema.parse({ ...rawData, reviewNote: bodyReviewNote });

    // ===== ROLE-BASED WORKFLOW ENFORCEMENT =====

    // --- JURNALIS (article author, non-editor) ---
    if (isOwner && !isEditor) {
      // Jurnalis "Batalkan Review": IN_REVIEW -> DRAFT (only by author)
      if (data.status === "DRAFT" && article.status === "IN_REVIEW") {
        const updated = await prisma.article.update({
          where: { id: params.id },
          data: {
            status: "DRAFT",
            reviewedBy: null,
            reviewNote: null,
            verificationLabel: "UNVERIFIED",
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
          "STATUS_CHANGE",
          "article",
          article.id,
          `Batalkan review: IN_REVIEW → DRAFT. Artikel: ${article.title}`
        );

        return successResponse(updated);
      }

      // Jurnalis can only edit if status is DRAFT or REJECTED
      if (!["DRAFT", "REJECTED"].includes(article.status)) {
        throw new ApiError("Artikel sedang dalam proses review", 403);
      }

      // Jurnalis cannot set PUBLISHED, APPROVED, or REJECTED
      if (data.status && !["DRAFT", "IN_REVIEW"].includes(data.status)) {
        throw new ApiError("Anda hanya dapat menyimpan draf atau mengirim untuk review", 403);
      }

      // If sending for review, randomly assign an editor
      let assignedReviewerId: string | null = article.reviewedBy;
      if (data.status === "IN_REVIEW") {
        const editors = await prisma.user.findMany({
          where: {
            role: { in: ["EDITOR", "CHIEF_EDITOR"] },
            isActive: true,
          },
          select: { id: true },
        });
        if (editors.length > 0) {
          const randomIndex = Math.floor(Math.random() * editors.length);
          assignedReviewerId = editors[randomIndex].id;
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

      const readTime = data.content ? calculateReadTime(data.content) : undefined;

      // Strip verificationLabel — system-controlled
      const { reviewNote: _rn, ...cleanData } = data;

      const updated = await prisma.article.update({
        where: { id: params.id },
        data: {
          ...cleanData,
          readTime,
          verificationLabel: "UNVERIFIED",
          reviewedBy: data.status === "IN_REVIEW" ? assignedReviewerId : article.reviewedBy,
          reviewNote: data.status === "IN_REVIEW" ? null : article.reviewNote,
          scheduledAt: cleanData.scheduledAt ? new Date(cleanData.scheduledAt) : undefined,
          ...(tagNames && Array.isArray(tagNames) && {
            tags: {
              set: [],
              connectOrCreate: tagNames.map((name: string) => ({
                where: { name },
                create: { name, slug: name.toLowerCase().replace(/\s+/g, "-") },
              })),
            },
          }),
        },
        include: {
          author: { select: { id: true, name: true } },
          category: { select: { id: true, name: true, slug: true } },
          tags: true,
          sources: true,
        },
      });

      // Handle sources
      if (sourcesData && Array.isArray(sourcesData)) {
        await prisma.source.deleteMany({ where: { articleId: params.id } });
        if (sourcesData.length > 0) {
          await prisma.source.createMany({
            data: sourcesData.map((s: { name: string; title?: string; institution?: string; url?: string }) => ({
              name: s.name,
              title: s.title,
              institution: s.institution,
              url: s.url,
              articleId: params.id,
            })),
          });
        }
      }

      await logAudit(
        session.user.id,
        "UPDATE",
        "article",
        article.id,
        `${data.status ? `Status → ${data.status}. ` : ""}Jurnalis mengedit artikel: ${article.title}`
      );

      return successResponse(updated);
    }

    // --- EDITOR (assigned editor reviewing) ---
    if (isEditor && !isAdmin) {
      // Editor "Batalkan Persetujuan": APPROVED -> IN_REVIEW (only by assigned editor)
      if (data.status === "IN_REVIEW" && article.status === "APPROVED") {
        if (!isAssignedEditor) {
          throw new ApiError("Hanya editor yang ditugaskan yang dapat membatalkan persetujuan", 403);
        }

        const updated = await prisma.article.update({
          where: { id: params.id },
          data: {
            status: "IN_REVIEW",
            verificationLabel: "UNVERIFIED",
            reviewNote: null,
            reviewedAt: null,
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
          "STATUS_CHANGE",
          "article",
          article.id,
          `Editor batalkan persetujuan: APPROVED → IN_REVIEW. Artikel: ${article.title}`
        );

        return successResponse(updated);
      }

      // Editor can only review articles IN_REVIEW assigned to them
      if (article.status !== "IN_REVIEW") {
        throw new ApiError("Artikel tidak dalam status review", 403);
      }

      if (!isAssignedEditor) {
        throw new ApiError("Artikel ini tidak ditugaskan kepada Anda", 403);
      }

      // Editor can APPROVE or REJECT (not PUBLISHED)
      if (!data.status || !["APPROVED", "REJECTED"].includes(data.status)) {
        throw new ApiError("Editor hanya dapat menyetujui atau menolak artikel", 403);
      }

      if (data.status === "REJECTED" && !data.reviewNote?.trim()) {
        throw new ApiError("Alasan penolakan wajib diisi", 400);
      }

      const verificationLabel = data.status === "APPROVED" ? "VERIFIED" : "UNVERIFIED";

      const updated = await prisma.article.update({
        where: { id: params.id },
        data: {
          status: data.status as "APPROVED" | "REJECTED",
          verificationLabel,
          reviewNote: data.reviewNote || null,
          reviewedBy: session.user.id,
          reviewedAt: new Date(),
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
        "STATUS_CHANGE",
        "article",
        article.id,
        `Editor ${data.status === "APPROVED" ? "menyetujui" : "menolak"} artikel: ${article.title}${data.reviewNote ? ` — Catatan: ${data.reviewNote}` : ""}`
      );

      return successResponse(updated);
    }

    // --- ADMIN (SUPER_ADMIN / CHIEF_EDITOR) ---
    if (isAdmin) {
      // Admin "Kembalikan ke Editor": APPROVED -> IN_REVIEW
      if (data.status === "IN_REVIEW" && article.status === "APPROVED") {
        const updated = await prisma.article.update({
          where: { id: params.id },
          data: {
            status: "IN_REVIEW",
            verificationLabel: "UNVERIFIED",
            reviewNote: data.reviewNote || "Dikembalikan oleh admin untuk review ulang",
            reviewedAt: new Date(),
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
          "STATUS_CHANGE",
          "article",
          article.id,
          `Admin/Editor batalkan persetujuan: APPROVED → IN_REVIEW. Artikel: ${article.title}`
        );

        return successResponse(updated);
      }

      // Admin can approve/reject articles IN_REVIEW (admin has editor privileges too)
      if (article.status === "IN_REVIEW" && data.status && ["APPROVED", "REJECTED"].includes(data.status)) {
        // Admin can review any article (doesn't need to be assigned)
        if (data.status === "REJECTED" && !data.reviewNote?.trim()) {
          throw new ApiError("Alasan penolakan wajib diisi", 400);
        }

        const verificationLabel = data.status === "APPROVED" ? "VERIFIED" : "UNVERIFIED";

        const updated = await prisma.article.update({
          where: { id: params.id },
          data: {
            status: data.status as "APPROVED" | "REJECTED",
            verificationLabel,
            reviewNote: data.reviewNote || null,
            reviewedBy: session.user.id,
            reviewedAt: new Date(),
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
          "STATUS_CHANGE",
          "article",
          article.id,
          `Admin ${data.status === "APPROVED" ? "menyetujui" : "menolak"} artikel: ${article.title}${data.reviewNote ? ` — Catatan: ${data.reviewNote}` : ""}`
        );

        return successResponse(updated);
      }

      // Admin publish: APPROVED -> PUBLISHED
      if (data.status === "PUBLISHED" && article.status === "APPROVED") {
        const updated = await prisma.article.update({
          where: { id: params.id },
          data: {
            status: "PUBLISHED",
            verificationLabel: "VERIFIED",
            publishedAt: new Date(),
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
          "STATUS_CHANGE",
          "article",
          article.id,
          `Admin mempublikasi artikel: ${article.title}`
        );

        return successResponse(updated);
      }

      // Admin return to editor: APPROVED -> IN_REVIEW (with optional note)
      if (data.status === "IN_REVIEW" && article.status === "APPROVED") {
        const updated = await prisma.article.update({
          where: { id: params.id },
          data: {
            status: "IN_REVIEW",
            verificationLabel: "UNVERIFIED",
            reviewNote: data.reviewNote || null,
            reviewedAt: null,
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
          "STATUS_CHANGE",
          "article",
          article.id,
          `Admin mengembalikan artikel ke editor: ${article.title}${data.reviewNote ? ` — Catatan: ${data.reviewNote}` : ""}`
        );

        return successResponse(updated);
      }

      // Admin CANNOT edit article content
      throw new ApiError("Admin tidak dapat mengedit konten artikel. Gunakan tombol aksi status.", 403);
    }

    // Fallback - shouldn't reach here
    throw new ApiError("Aksi tidak diizinkan", 403);
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
