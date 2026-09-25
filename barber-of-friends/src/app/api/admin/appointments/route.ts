import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(request: Request) {
  try {
    const session = await getSession();
    if (!session || (session.role !== "ADMIN" && session.role !== "BARBER")) {
      return NextResponse.json({ error: "Acesso não autorizado." }, { status: 403 });
    }

    const body = await request.json();
    const id = Number(body.id);
    const status = String(body.status || "");
    const allowed = ["CONFIRMED", "COMPLETED", "CANCELLED", "NO_SHOW"];

    if (!Number.isInteger(id) || id <= 0 || !allowed.includes(status)) {
      return NextResponse.json({ error: "Dados do atendimento inválidos." }, { status: 400 });
    }

    const appointment = await prisma.appointment.findUnique({ where: { id }, select: { id: true, clientId: true, status: true, discountPercent: true } });
    if (!appointment) return NextResponse.json({ error: "Atendimento não encontrado." }, { status: 404 });

    const updated = await prisma.appointment.update({ where: { id }, data: { status: status as "CONFIRMED" | "COMPLETED" | "CANCELLED" | "NO_SHOW" } });

    if (status === "COMPLETED" && appointment.status !== "COMPLETED" && appointment.clientId) {
      await prisma.user.update({ where: { id: appointment.clientId }, data: { totalCompletedCuts: { increment: 1 } } });

      const activeOffer = await prisma.loyaltyHistory.findFirst({
        where: { clientId: appointment.clientId, discountGenerated: false },
        select: { id: true },
      });

      if (Number(appointment.discountPercent) === 50) {
        await prisma.loyaltyHistory.updateMany({
          where: { clientId: appointment.clientId, discountGenerated: false },
          data: { discountGenerated: true },
        });
      }

      const lastConsumedOffer = await prisma.loyaltyHistory.findFirst({
        where: { clientId: appointment.clientId, discountGenerated: true },
        orderBy: { createdAt: "desc" },
        select: { appointmentId: true },
      });

      const completedSinceLastReward = await prisma.appointment.count({
        where: {
          clientId: appointment.clientId,
          status: "COMPLETED",
          ...(lastConsumedOffer ? { id: { gt: lastConsumedOffer.appointmentId } } : {}),
        },
      });

      if (!activeOffer && Number(appointment.discountPercent) !== 50 && completedSinceLastReward >= 5) {
        await prisma.loyaltyHistory.create({
          data: {
            clientId: appointment.clientId,
            appointmentId: appointment.id,
            cutsCount: completedSinceLastReward,
            discountGenerated: false,
          },
        });
      }
    }

    return NextResponse.json({ success: true, status: updated.status });
  } catch (error) {
    console.error("Erro ao atualizar atendimento:", error);
    return NextResponse.json({ error: "Não foi possível atualizar o atendimento." }, { status: 500 });
  }
}
