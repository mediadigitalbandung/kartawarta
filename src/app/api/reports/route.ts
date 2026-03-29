import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { successResponse, errorResponse, requireRole } from "@/lib/api-utils";

const updateReportSchema = z.object({
  id: z.string().min(1),
  status: z.enum(["PENDING", "REVIEWED", "RESOLVED", "DISMISSED"]),
});

const createReportSchema = z.object({
  articleId: z.string().min(1),
  reason: z.enum(["HOAX", "INACCURATE", "SARA", "DEFAMATION", "OTHER"]),
  detail: z.string().max(1000).optional(),
  email: z.string().email().optional(),
});

// GET /api/reports — admin only (supports pagination)
export async function GET(request: NextRequest) {
  try {
    await requireRole(["SUPER_ADMIN", "CHIEF_EDITOR", "EDITOR"]);

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)));
    const status = searchParams.get("status"); // "PENDING" | "REVIEWED" | "RESOLVED" | "DISMISSED" | null

    const where: Record<string, unknown> = {};
    if (status && ["PENDING", "REVIEWED", "RESOLVED", "DISMISSED"].includes(status)) {
      where.status = status;
    }

    const [reports, total, pendingCount] = await Promise.all([
      prisma.report.findMany({
        where,
        include: {
          article: {
            select: { id: true, title: true, slug: true, author: { select: { name: true } } },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.report.count({ where }),
      prisma.report.count({ where: { status: "PENDING" } }),
    ]);

    return successResponse({
      reports,
      total,
      pendingCount,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    return errorResponse(error);
  }
}

// PATCH /api/reports — update report status (editor+)
export async function PATCH(request: NextRequest) {
  try {
    await requireRole(["SUPER_ADMIN", "CHIEF_EDITOR", "EDITOR"]);

    const body = await request.json();
    const data = updateReportSchema.parse(body);

    const existing = await prisma.report.findUnique({ where: { id: data.id } });
    if (!existing) {
      return errorResponse({ message: "Laporan tidak ditemukan", statusCode: 404 });
    }

    const report = await prisma.report.update({
      where: { id: data.id },
      data: { status: data.status },
    });

    return successResponse(report);
  } catch (error) {
    return errorResponse(error);
  }
}

// POST /api/reports — public
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = createReportSchema.parse(body);

    const article = await prisma.article.findUnique({ where: { id: data.articleId } });
    if (!article) {
      return errorResponse({ message: "Artikel tidak ditemukan", statusCode: 404 });
    }

    const report = await prisma.report.create({ data });

    return successResponse(report, 201);
  } catch (error) {
    return errorResponse(error);
  }
}
