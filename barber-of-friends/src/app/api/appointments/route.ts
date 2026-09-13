import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

const SERVICES = {
  "Corte normal": 45,
  "Corte premium": 80,
} as const;

export async function GET() {
  const appointments = await prisma.appointment.findMany({
    orderBy: { date: "asc" },
    select: { id: true, date: true, service: true, status: true },
  });
  return NextResponse.json(appointments);
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    const body = await request.json();
    const { date, service, guestName, guestPhone, guestEmail } = body;
    const appointmentDate = new Date(date);

    if (Number.isNaN(appointmentDate.getTime()) || appointmentDate.getMinutes() % 30 !== 0) {
      return NextResponse.json({ error: "Escolha um horário válido de 30 em 30 minutos." }, { status: 400 });
    }

    if (appointmentDate <= new Date()) {
      return NextResponse.json({ error: "Escolha um horário futuro." }, { status: 400 });
    }

    if (appointmentDate.getDay() === 0) {
      return NextResponse.json({ error: "Aos domingos não realizamos agendamentos." }, { status: 400 });
    }

    const selectedService = service as keyof typeof SERVICES;
    if (!selectedService || !(selectedService in SERVICES)) {
      return NextResponse.json({ error: "Escolha um serviço válido." }, { status: 400 });
    }

    if (!session && (!guestName?.trim() || !guestPhone?.trim())) {
      return NextResponse.json({ error: "Informe seu nome e telefone para confirmar o agendamento." }, { status: 400 });
    }

    const originalPrice = SERVICES[selectedService];
    let discountPercent = 0;

    if (selectedService === "Corte premium" && session) {
      const completedCuts = await prisma.appointment.count({
        where: { clientId: session.id, status: "COMPLETED" },
      });
      if (completedCuts >= 5) discountPercent = 50;
    }

    const price = originalPrice * (1 - discountPercent / 100);

    const appointment = await prisma.appointment.create({
      data: {
        clientId: session?.id,
        guestName: session ? null : guestName.trim(),
        guestPhone: session ? null : guestPhone.trim(),
        guestEmail: session ? null : guestEmail?.trim() || null,
        date: appointmentDate,
        service: selectedService,
        originalPrice,
        price,
        discountPercent,
      },
    });

    return NextResponse.json(appointment, { status: 201 });
  } catch (error: unknown) {
    const code = error && typeof error === "object" && "code" in error ? String((error as { code?: string }).code) : "";
    if (code === "P2002") return NextResponse.json({ error: "Este horário já está reservado." }, { status: 409 });
    return NextResponse.json({ error: "Não foi possível realizar o agendamento." }, { status: 500 });
  }
}
