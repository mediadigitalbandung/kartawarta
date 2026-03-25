import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  successResponse,
  errorResponse,
  requireRole,
  logAudit,
  ApiError,
} from "@/lib/api-utils";

// DELETE /api/ads/:id
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireRole(["SUPER_ADMIN", "CHIEF_EDITOR"]);

    const ad = await prisma.ad.findUnique({
      where: { id: params.id },
    });

    if (!ad) {
      throw new ApiError("Iklan tidak ditemukan", 404);
    }

    await prisma.ad.delete({ where: { id: params.id } });

    await logAudit(
      session.user.id,
      "DELETE",
      "ad",
      params.id,
      `Menghapus iklan: ${ad.name}`
    );

    return successResponse({ deleted: true });
  } catch (error) {
    return errorResponse(error);
  }
}
