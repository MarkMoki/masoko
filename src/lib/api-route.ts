import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { ApiError } from "./api";
import { getSession } from "./auth";
import { Role } from "@/lib/types";

export function json<T>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}

export function errorResponse(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export function handleApiError(err: unknown) {
  if (err instanceof ApiError) {
    return errorResponse(err.message, err.status);
  }
  if (err instanceof ZodError) {
    return errorResponse(err.errors[0]?.message ?? "Validation error", 400);
  }
  if (err instanceof Error) {
    console.error(err);
    return errorResponse(err.message, 500);
  }
  return errorResponse("Internal server error", 500);
}

export async function requireAuth(...roles: Role[]) {
  const session = await getSession();
  if (!session) {
    throw new ApiError("Unauthorized", 401);
  }
  if (roles.length > 0 && !roles.includes(session.role)) {
    throw new ApiError("Forbidden", 403);
  }
  return session;
}