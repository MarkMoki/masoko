import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { Role } from "@/lib/types";

const COOKIE_NAME = "masoko_token";

async function getSessionFromRequest(req: NextRequest) {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (!token || !process.env.JWT_SECRET) return null;
  try {
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(process.env.JWT_SECRET)
    );
    if (!payload.sub) return null;
    return {
      sub: payload.sub as string,
      role: payload.role as Role,
    };
  } catch {
    return null;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const session = await getSessionFromRequest(req);

  const adminRoutes = pathname.startsWith("/admin");
  const merchantRoutes = pathname.startsWith("/merchant");
  const customerRoutes =
    pathname.startsWith("/cart") ||
    pathname.startsWith("/checkout") ||
    pathname.startsWith("/orders");

  if (adminRoutes) {
    if (!session) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    if (session.role !== Role.ADMIN) {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  if (merchantRoutes) {
    if (!session) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    if (session.role !== Role.SELLER && session.role !== Role.ADMIN) {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  if (customerRoutes) {
    if (!session) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    if (session.role !== Role.CUSTOMER) {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/merchant/:path*", "/cart", "/checkout", "/orders/:path*"],
};