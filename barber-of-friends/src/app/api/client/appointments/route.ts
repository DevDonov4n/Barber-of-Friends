import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  const appointments = await prisma.$queryRaw<Array<{
    id: number;
    appointment_date: string;
    start_time: string;
    final_price: number;
    status: string;
    service_name: string;
  }>>`
    SELECT a.id,
           DATE_FORMAT(a.appointment_date, '%Y-%m-%d') AS appointment_date,
           TIME_FORMAT(a.start_time, '%H:%i') AS start_time,
           a.final_price,
           a.status,
           s.name AS service_name
    FROM appointments a
    INNER JOIN services s ON s.id = a.service_id
    WHERE a.client_id = ${session.id}
    ORDER BY a.appointment_date ASC, a.start_time ASC
  `;

  return NextResponse.json(appointments.map(a => ({
    id: a.id,
    appointmentDate: a.appointment_date,
    startTime: a.start_time,
    finalPrice: a.final_price,
    status: a.status,
    service: { name: a.service_name },
  })));
}
