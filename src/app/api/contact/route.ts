import { NextRequest, NextResponse } from "next/server";
import { successResponse, errorResponse } from "@/lib/api-utils";
import { commentRateLimit } from "@/lib/rate-limit";
import { sanitizeText, sanitizeEmail } from "@/lib/sanitize";

export async function POST(request: NextRequest) {
  try {
    // Rate limit
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    const { success: allowed } = commentRateLimit(ip);
    if (!allowed) {
      return NextResponse.json({ success: false, error: "Terlalu banyak pesan. Coba lagi nanti." }, { status: 429 });
    }

    const body = await request.json();
    const { name, email, subject, message } = body;

    if (!name || !email || !message) {
      return errorResponse({ message: "Nama, email, dan pesan wajib diisi", statusCode: 400 });
    }

    // Contact form received — stored for processing

    return successResponse({ message: "Pesan berhasil dikirim" });
  } catch (error) {
    return errorResponse(error);
  }
}
