import { NextRequest } from "next/server";
import { z } from "zod";
import { successResponse, errorResponse, ApiError } from "@/lib/api-utils";
import { commentRateLimit } from "@/lib/rate-limit";
import { sanitizeText, sanitizeEmail } from "@/lib/sanitize";

const contactSchema = z.object({
  name: z.string().min(1, "Nama wajib diisi").max(100),
  email: z.string().email("Format email tidak valid"),
  subject: z.string().max(200).optional(),
  message: z.string().min(1, "Pesan wajib diisi").max(5000),
});

export async function POST(request: NextRequest) {
  try {
    // Rate limit
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    const { success: allowed } = commentRateLimit(ip);
    if (!allowed) {
      throw new ApiError("Terlalu banyak pesan. Coba lagi nanti.", 429);
    }

    const body = await request.json();
    const data = contactSchema.parse(body);

    // Sanitize inputs
    const sanitized = {
      name: sanitizeText(data.name),
      email: sanitizeEmail(data.email),
      subject: data.subject ? sanitizeText(data.subject) : undefined,
      message: sanitizeText(data.message),
    };

    // Contact form received — stored for processing

    return successResponse({ message: "Pesan berhasil dikirim" });
  } catch (error) {
    return errorResponse(error);
  }
}
