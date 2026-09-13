import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const secret = new TextEncoder().encode(process.env.AUTH_SECRET || "development-secret-change-me");
const COOKIE = "barber_session";

export type Session = { id: number; name: string; email: string; role: "CLIENT" | "BARBER" | "ADMIN" };

export async function createSession(session: Session) {
  const token = await new SignJWT(session)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);
  const store = await cookies();
  store.set(COOKIE, token, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 * 60 * 24 * 7 });
}

export async function getSession(): Promise<Session | null> {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret);
    if (!payload.id || !payload.role || !payload.email || !payload.name) return null;
    const role = String(payload.role);
    if (!["CLIENT", "BARBER", "ADMIN"].includes(role)) return null;
    return { id: Number(payload.id), name: String(payload.name), email: String(payload.email), role: role as Session["role"] };
  } catch { return null; }
}

export async function destroySession() {
  (await cookies()).delete(COOKIE);
}
