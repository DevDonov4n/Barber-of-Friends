import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  const appointments = await prisma.appointment.findMany({ orderBy: { date: "asc" }, select: { id: true, date: true, service: true, status: true } });
  return NextResponse.json(appointments);
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Faça login para agendar." }, { status: 401 });
  try {
    const { date, service } = await request.json(); const appointmentDate = new Date(date);
    if (Number.isNaN(appointmentDate.getTime()) || appointmentDate.getMinutes() % 30 !== 0) return NextResponse.json({ error: "Escolha um horário válido de 30 em 30 minutos." }, { status: 400 });
    if (appointmentDate <= new Date()) return NextResponse.json({ error: "Escolha um horário futuro." }, { status: 400 });
    const appointment = await prisma.appointment.create({ data: { clientId: session.id, date: appointmentDate, service: service || "Corte" } });
    return NextResponse.json(appointment, { status: 201 });
  } catch (error: unknown) { const code = error && typeof error === "object" && "code" in error ? String((error as { code?: string }).code) : ""; if (code === "P2002") return NextResponse.json({ error: "Este horário já está reservado." }, { status: 409 }); return NextResponse.json({ error: "Não foi possível realizar o agendamento." }, { status: 500 }); }
}
