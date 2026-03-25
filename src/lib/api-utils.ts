import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "./auth";
import { Role } from "@prisma/client";
import { prisma } from "./prisma";

export async function getSession() {
  return getServerSession(authOptions);
}

export async function requireAuth() {
  const session = await getSession();
  if (!session?.user) {
    throw new ApiError("Unauthorized", 401);
  }
  return session;
}

export async function requireRole(roles: Role[]) {
  const session = await requireAuth();
  if (!roles.includes(session.user.role)) {
    throw new ApiError("Forbidden", 403);
  }
  return session;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number = 400
  ) {
    super(message);
  }
}

export function successResponse(data: unknown, status = 200) {
  return NextResponse.json({ success: true, data }, { status });
}

export function errorResponse(error: unknown) {
  if (error instanceof ApiError) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: error.statusCode }
    );
  }
  console.error("API Error:", error);
  return NextResponse.json(
    { success: false, error: "Internal server error" },
    { status: 500 }
  );
}

export async function logAudit(
  userId: string,
  action: string,
  entity: string,
  entityId: string,
  detail?: string,
  ip?: string
) {
  await prisma.auditLog.create({
    data: { userId, action, entity, entityId, detail, ip },
  });
}
