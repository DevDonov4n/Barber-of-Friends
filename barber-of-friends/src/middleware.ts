import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const secret = new TextEncoder().encode(process.env.AUTH_SECRET || "development-secret-change-me");

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  if (!path.startsWith("/painel")) return NextResponse.next();

  const token = request.cookies.get("barber_session")?.value;
  const loginUrl = new URL(`/login?next=${encodeURIComponent(path)}`, request.url);
  if (!token) return NextResponse.redirect(loginUrl);

  try {
    const { payload } = await jwtVerify(token, secret);
    const role = payload.role;

    if (path.startsWith("/painel/barbeiro")) {
      if (role !== "BARBER" && role !== "ADMIN") {
        return NextResponse.redirect(new URL("/painel/cliente", request.url));
      }
      return NextResponse.next();
    }

    if (path.startsWith("/painel/cliente")) {
      if (role !== "CLIENT") {
        return NextResponse.redirect(new URL("/painel/barbeiro", request.url));
      }
      return NextResponse.next();
    }

    if (role === "BARBER" || role === "ADMIN") {
      return NextResponse.next();
    }

    return NextResponse.next();
  } catch {
    return NextResponse.redirect(loginUrl);
  }
}

export const config = { matcher: ["/painel/:path*"] };
