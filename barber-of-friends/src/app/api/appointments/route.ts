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

    if (Number.isNaN(selectedDate.getTime())) {
      return NextResponse.json({ error: "Escolha uma data e horário válidos." }, { status: 400 });
    }

    if (selectedDate.getMinutes() % 30 !== 0) {
      return NextResponse.json({ error: "Escolha um horário de 30 em 30 minutos." }, { status: 400 });
    }

    if (selectedDate <= new Date()) {
      return NextResponse.json({ error: "Escolha um horário futuro." }, { status: 400 });
    }

    if (selectedDate.getDay() === 0) {
      return NextResponse.json({ error: "Aos domingos não realizamos agendamentos." }, { status: 400 });
    }

    const hour = selectedDate.getHours();
    const minutes = selectedDate.getMinutes();
    const totalMinutes = hour * 60 + minutes;

    if (totalMinutes < 9 * 60 || totalMinutes > 20 * 60) {
      return NextResponse.json({ error: "Os agendamentos funcionam das 09:00 às 20:00." }, { status: 400 });
    }

    if (!service || !["Corte normal", "Corte premium"].includes(service)) {
      return NextResponse.json({ error: "Escolha um serviço válido." }, { status: 400 });
    }

    const cleanGuestName = typeof guestName === "string" ? guestName.trim() : "";

    if (!session && !cleanGuestName) {
      return NextResponse.json({ error: "Informe seu nome para confirmar o agendamento." }, { status: 400 });
    }

    const services = await prisma.$queryRaw<Array<{
      id: number;
      price: number;
      duration_minutes: number;
      active: number | boolean;
    }>>`
      SELECT id, price, duration_minutes, active
      FROM services
      WHERE name = ${service}
      LIMIT 1
    `;

    const serviceRecord = services[0];

    if (!serviceRecord || !Boolean(serviceRecord.active)) {
      return NextResponse.json({ error: "Este serviço não está disponível." }, { status: 400 });
    }

    const appointmentDate = selectedDate.toISOString().slice(0, 10);
    const startTime = `${String(hour).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:00`;

    const duration = Number(serviceRecord.duration_minutes || 30);
    const end = new Date(selectedDate.getTime() + duration * 60_000);
    const endTime = `${String(end.getHours()).padStart(2, "0")}:${String(end.getMinutes()).padStart(2, "0")}:00`;

    if (end.getHours() * 60 + end.getMinutes() > 20 * 60 + 30) {
      return NextResponse.json({ error: "Esse serviço termina após o horário de funcionamento." }, { status: 400 });
    }

    const completedRows = session
      ? await prisma.$queryRaw<Array<{ total: number }>>`
          SELECT COUNT(*) AS total
          FROM appointments
          WHERE client_id = ${session.id}
            AND status = 'COMPLETED'
        `
      : [{ total: 0 }];

    const completedCuts = Number(completedRows[0]?.total || 0);
    const discountPercent = service === "Corte premium" && completedCuts >= 5 ? 50 : 0;
    const originalPrice = Number(serviceRecord.price);
    const finalPrice = originalPrice * (1 - discountPercent / 100);

    // As colunas date/price/service ainda existem no banco durante a migração.
    // Preenchê-las evita erro de NOT NULL enquanto elas não forem removidas.
    await prisma.$executeRaw`
      INSERT INTO appointments (
        client_id,
        service_id,
        barber_id,
        guest_name,
        appointment_date,
        start_time,
        end_time,
        original_price,
        discount_percent,
        final_price,
        status,
        date,
        price,
        service
      ) VALUES (
        ${session?.id ?? null},
        ${serviceRecord.id},
        NULL,
        ${session ? null : cleanGuestName},
        ${appointmentDate},
        ${startTime},
        ${endTime},
        ${originalPrice},
        ${discountPercent},
        ${finalPrice},
        'CONFIRMED',
        ${selectedDate},
        ${originalPrice},
        ${service}
      )
    `;

    const createdRows = await prisma.$queryRaw<Array<{
      id: number;
      appointment_date: string;
      start_time: string;
      final_price: number;
      discount_percent: number;
    }>>`
      SELECT id, appointment_date, start_time, final_price, discount_percent
      FROM appointments
      WHERE appointment_date = ${appointmentDate}
        AND start_time = ${startTime}
      ORDER BY id DESC
      LIMIT 1
    `;

    const created = createdRows[0];

    return NextResponse.json(
      {
        id: created?.id,
        appointmentDate: created?.appointment_date,
        startTime: created?.start_time,
        finalPrice: created?.final_price,
        discountPercent: created?.discount_percent,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);

    if (message.includes("uq_appointment_slot") || message.includes("Duplicate entry")) {
      return NextResponse.json({ error: "Este horário já está reservado." }, { status: 409 });
    }

    console.error("Erro ao criar agendamento:", error);
    return NextResponse.json({ error: "Não foi possível realizar o agendamento." }, { status: 500 });
  }
}
