import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  const appointments = await prisma.appointment.findMany({
    where: { clientId: session.id },
    orderBy: [{ appointmentDate: "asc" }, { startTime: "asc" }],
    include: { service: { select: { name: true } } },
  });

  return NextResponse.json(appointments);
}
