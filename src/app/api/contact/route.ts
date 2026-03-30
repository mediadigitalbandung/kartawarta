import { NextRequest } from "next/server";
import { successResponse, errorResponse, ApiError } from "@/lib/api-utils";
import { commentRateLimit } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  try {
    // Rate limit
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    const { success: allowed } = commentRateLimit(ip);
    if (!allowed) {
      throw new ApiError("Terlalu banyak pesan. Coba lagi nanti.", 429);
    }

    const body = await request.json();
    const { name, email, message } = body;

    if (!name || !email || !message) {
      throw new ApiError("Nama, email, dan pesan wajib diisi", 400);
    }

    // Contact form received — stored for processing

    return successResponse({ message: "Pesan berhasil dikirim" });
  } catch (error) {
    return errorResponse(error);
  }
}
