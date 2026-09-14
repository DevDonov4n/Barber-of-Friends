import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  const user = await prisma.user.findUnique({ where: { id: session.id }, select: { id: true, name: true, email: true, phone: true, favoriteCut: true, role: true } });
  if (!user) return NextResponse.json({ error: "Cliente não encontrado." }, { status: 404 });
  return NextResponse.json({ user });
}
