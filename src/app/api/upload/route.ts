import { NextRequest } from "next/server";
import { requireAuth, ApiError, successResponse, errorResponse } from "@/lib/api-utils";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { randomBytes } from "crypto";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    await requireAuth();

    const formData = await request.formData();
    const file = formData.get("file") as File;
    if (!file) {
      throw new ApiError("No file provided", 400);
    }

    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      throw new ApiError("Format gambar tidak didukung. Gunakan JPEG, PNG, atau WebP.", 400);
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      throw new ApiError("Ukuran gambar maksimal 5MB", 400);
    }

    const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
    const filename = `${Date.now()}-${randomBytes(6).toString("hex")}.${ext}`;

    // Save to /public/uploads/
    const uploadDir = join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });
    const bytes = await file.arrayBuffer();
    await writeFile(join(uploadDir, filename), Buffer.from(bytes));

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "";
    const url = `${appUrl}/uploads/${filename}`;

    return successResponse({ url });
  } catch (error) {
    return errorResponse(error);
  }
}
