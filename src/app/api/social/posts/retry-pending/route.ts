import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole, successResponse, errorResponse, logAudit } from "@/lib/api-utils";
import { startApproveDraft } from "@/lib/social/orchestrator";

export const dynamic = "force-dynamic";

/**
 * POST /api/social/posts/retry-pending
 * Batch retry all pending or rejected social media posts.
 */
export async function POST(_req: NextRequest) {
  try {
    const session = await requireRole(["SUPER_ADMIN", "CHIEF_EDITOR", "EDITOR"]);

    const pendingOrRejected = await prisma.socialPost.findMany({
      where: {
        status: { in: ["PENDING", "REJECTED"] },
      },
      select: { id: true, platform: true, status: true },
      take: 20,
    });

    if (pendingOrRejected.length === 0) {
      return successResponse({ processed: 0, message: "Tidak ada antrean PENDING atau REJECTED." });
    }

    let successCount = 0;
    let failCount = 0;
    const errors: string[] = [];

    for (const post of pendingOrRejected) {
      try {
        const res = await startApproveDraft(post.id);
        if (res.success) {
          successCount++;
        } else {
          failCount++;
          if (res.error) errors.push(`${post.platform}: ${res.error}`);
        }
      } catch (e) {
        failCount++;
        errors.push(`${post.platform}: ${e instanceof Error ? e.message : String(e)}`);
      }
    }

    await logAudit(
      session.user.id,
      "RETRY_BATCH",
      "social_post",
      "batch",
      `Batch retry: ${successCount} success, ${failCount} failed out of ${pendingOrRejected.length}`,
    );

    return successResponse({
      total: pendingOrRejected.length,
      successCount,
      failCount,
      errors: Array.from(new Set(errors)),
    });
  } catch (err) {
    return errorResponse(err);
  }
}
