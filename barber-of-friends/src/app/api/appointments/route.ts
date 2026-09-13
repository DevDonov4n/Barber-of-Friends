import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  const appointments = await prisma.appointment.findMany({
    orderBy: [{ appointmentDate: "asc" }, { startTime: "asc" }],
    select: { id: true, appointmentDate: true, startTime: true, status: true },
  });
  return NextResponse.json(appointments);
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    const body = await request.json();
    const { date, service, guestName } = body;
    const selectedDate = new Date(date);

    if (Number.isNaN(selectedDate.getTime()) || selectedDate.getMinutes() % 30 !== 0) {
      return NextResponse.json({ error: "Escolha um horário válido de 30 em 30 minutos." }, { status: 400 });
    }
    if (selectedDate <= new Date()) return NextResponse.json({ error: "Escolha um horário futuro." }, { status: 400 });
    if (selectedDate.getDay() === 0) return NextResponse.json({ error: "Aos domingos não realizamos agendamentos." }, { status: 400 });
    if (!service || !["Corte normal", "Corte premium"].includes(service)) return NextResponse.json({ error: "Escolha um serviço válido." }, { status: 400 });
    if (!session && !guestName?.trim()) return NextResponse.json({ error: "Informe seu nome para confirmar o agendamento." }, { status: 400 });

    const serviceRecord = await prisma.service.findUnique({ where: { name: service } });
    if (!serviceRecord || !serviceRecord.active) return NextResponse.json({ error: "Este serviço não está disponível." }, { status: 400 });

    const appointmentDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
    const startTime = new Date(1970, 0, 1, selectedDate.getHours(), selectedDate.getMinutes(), 0, 0);
    const endTime = new Date(startTime.getTime() + serviceRecord.durationMinutes * 60_000);

    const completedCuts = session
      ? await prisma.appointment.count({ where: { clientId: session.id, status: "COMPLETED" } })
      : 0;
    const discountPercent = service === "Corte premium" && completedCuts >= 5 ? 50 : 0;
    const finalPrice = Number(serviceRecord.price) * (1 - discountPercent / 100);

    const appointment = await prisma.appointment.create({
      data: {
        clientId: session?.id,
        serviceId: serviceRecord.id,
        guestName: session ? null : guestName.trim(),
        appointmentDate,
        startTime,
        endTime,
        originalPrice: serviceRecord.price,
        discountPercent,
        finalPrice,
      },
      select: { id: true, appointmentDate: true, startTime: true, finalPrice: true, discountPercent: true },
    });

    return NextResponse.json(appointment, { status: 201 });
  } catch (error: unknown) {
    const code = error && typeof error === "object" && "code" in error ? String((error as { code?: string }).code) : "";
    if (code === "P2002") return NextResponse.json({ error: "Este horário já está reservado." }, { status: 409 });
    return NextResponse.json({ error: "Não foi possível realizar o agendamento." }, { status: 500 });
  }
}
