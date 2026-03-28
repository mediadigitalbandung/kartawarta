import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.id) {
      // Clear active session ID so another device can login
      await prisma.user.update({
        where: { id: session.user.id },
        data: { activeSessionId: null },
      });
    }
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false });
  }
}
