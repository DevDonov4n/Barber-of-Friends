import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json();
    if (!name?.trim() || !email?.trim() || !password || password.length < 6) return NextResponse.json({ error: "Nome, e-mail e senha (mínimo 6 caracteres) são obrigatórios." }, { status: 400 });
    const normalizedEmail = email.trim().toLowerCase();
    const exists = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (exists) return NextResponse.json({ error: "E-mail já cadastrado." }, { status: 409 });
    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({ data: { name: name.trim(), email: normalizedEmail, passwordHash } });
    await createSession({ id: user.id, name: user.name, email: user.email, role: user.role });
    return NextResponse.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role } }, { status: 201 });
  } catch { return NextResponse.json({ error: "Não foi possível criar a conta." }, { status: 500 }); }
}
