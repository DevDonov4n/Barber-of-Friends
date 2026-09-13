import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const secret = new TextEncoder().encode(process.env.AUTH_SECRET || "development-secret-change-me");

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  if (!path.startsWith("/painel")) return NextResponse.next();
  const token = request.cookies.get("barber_session")?.value;
  if (!token) return NextResponse.redirect(new URL("/login?next=/painel/barbeiro", request.url));
  try {
    const { payload } = await jwtVerify(token, secret);
    if (payload.role !== "BARBER" && payload.role !== "ADMIN") return NextResponse.redirect(new URL("/agendar", request.url));
    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL("/login?next=/painel/barbeiro", request.url));
  }
}

export const config = { matcher: ["/painel/:path*"] };
