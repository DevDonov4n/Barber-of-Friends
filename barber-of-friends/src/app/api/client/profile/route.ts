import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { getSession, createSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  const user = await prisma.user.findUnique({ where: { id: session.id }, select: { id: true, name: true, email: true, phone: true, favoriteCut: true, role: true } });
  if (!user) return NextResponse.json({ error: "Cliente não encontrado." }, { status: 404 });
  return NextResponse.json({ user });
}

export async function PUT(request: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
    const body = await request.json();
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const phone = typeof body.phone === "string" ? body.phone.trim() : "";
    const favoriteCut = typeof body.favoriteCut === "string" ? body.favoriteCut.trim() : "";
    const currentPassword = typeof body.currentPassword === "string" ? body.currentPassword : "";
    const newPassword = typeof body.newPassword === "string" ? body.newPassword : "";
    if (!name || !email) return NextResponse.json({ error: "Nome e e-mail são obrigatórios." }, { status: 400 });
    if (newPassword && newPassword.length < 6) return NextResponse.json({ error: "A nova senha deve ter no mínimo 6 caracteres." }, { status: 400 });
    const user = await prisma.user.findUnique({ where: { id: session.id } });
    if (!user) return NextResponse.json({ error: "Cliente não encontrado." }, { status: 404 });
    if (email !== user.email) {
      const emailExists = await prisma.user.findUnique({ where: { email } });
      if (emailExists && emailExists.id !== user.id) return NextResponse.json({ error: "Este e-mail já está em uso." }, { status: 409 });
    }
    if (newPassword && (!currentPassword || !(await bcrypt.compare(currentPassword, user.passwordHash)))) {
      return NextResponse.json({ error: "A senha atual está incorreta." }, { status: 400 });
    }
    const passwordHash = newPassword ? await bcrypt.hash(newPassword, 12) : user.passwordHash;
    const updated = await prisma.user.update({ where: { id: user.id }, data: { name, email, phone: phone || null, favoriteCut: favoriteCut || null, passwordHash }, select: { id: true, name: true, email: true, phone: true, favoriteCut: true, role: true } });
    await createSession({ id: updated.id, name: updated.name, email: updated.email, role: updated.role });
    return NextResponse.json({ user: updated });
  } catch (error) {
    console.error("Erro ao atualizar perfil:", error);
    return NextResponse.json({ error: "Não foi possível atualizar seus dados." }, { status: 500 });
  }
}
