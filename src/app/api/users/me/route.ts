import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import {
  successResponse,
  errorResponse,
  requireAuth,
} from "@/lib/api-utils";

const updateProfileSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter").max(100).optional(),
  bio: z.string().max(500).optional().nullable(),
  specialization: z.string().max(200).optional().nullable(),
});

// GET /api/users/me — get current user profile
export async function GET() {
  try {
    const session = await requireAuth();

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        bio: true,
        specialization: true,
        avatar: true,
        phone: true,
        createdAt: true,
        _count: {
          select: { articles: true },
        },
      },
    });

    if (!user) {
      return errorResponse(new Error("User tidak ditemukan"));
    }

    return successResponse(user);
  } catch (error) {
    return errorResponse(error);
  }
}

// PUT /api/users/me — update current user profile (name, bio, specialization only)
export async function PUT(request: NextRequest) {
  try {
    const session = await requireAuth();
    const body = await request.json();
    const data = updateProfileSchema.parse(body);

    const updated = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.bio !== undefined && { bio: data.bio }),
        ...(data.specialization !== undefined && { specialization: data.specialization }),
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        bio: true,
        specialization: true,
        avatar: true,
        createdAt: true,
      },
    });

    return successResponse(updated);
  } catch (error) {
    return errorResponse(error);
  }
}
