import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/api-utils";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, subject, message } = body;

    if (!name || !email || !message) {
      return errorResponse({ message: "Nama, email, dan pesan wajib diisi", statusCode: 400 });
    }

    // Log contact form submission
    console.log("Contact form submission:", { name, email, subject, message, timestamp: new Date().toISOString() });

    return successResponse({ message: "Pesan berhasil dikirim" });
  } catch (error) {
    return errorResponse(error);
  }
}
