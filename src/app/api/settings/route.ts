import { NextRequest } from "next/server";
import { requireRole, successResponse, errorResponse, ApiError } from "@/lib/api-utils";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    await requireRole(["SUPER_ADMIN"]);

    const settings = await prisma.systemSetting.findMany();
    const keyValue: Record<string, string> = {};
    for (const s of settings) {
      keyValue[s.key] = s.value;
    }

    return successResponse(keyValue);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PUT(req: NextRequest) {
  try {
    await requireRole(["SUPER_ADMIN"]);

    const body = await req.json();
    const { key, value } = body as { key: string; value: string };

    if (!key || value === undefined) {
      throw new ApiError("Field key dan value diperlukan", 400);
    }

    await prisma.systemSetting.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });

    return successResponse({ key, value });
  } catch (error) {
    return errorResponse(error);
  }
}
