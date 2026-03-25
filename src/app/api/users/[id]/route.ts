import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  successResponse,
  errorResponse,
  requireRole,
  logAudit,
  ApiError,
} from "@/lib/api-utils";

// DELETE /api/users/:id
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireRole(["SUPER_ADMIN"]);

    const user = await prisma.user.findUnique({
      where: { id: params.id },
    });

    if (!user) {
      throw new ApiError("Pengguna tidak ditemukan", 404);
    }

    if (user.id === session.user.id) {
      throw new ApiError("Tidak dapat menghapus akun sendiri", 400);
    }

    await prisma.user.delete({ where: { id: params.id } });

    await logAudit(
      session.user.id,
      "DELETE",
      "user",
      params.id,
      `Menghapus pengguna: ${user.name} (${user.email})`
    );

    return successResponse({ deleted: true });
  } catch (error) {
    return errorResponse(error);
  }
}
