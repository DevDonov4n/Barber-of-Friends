import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== "CLIENT") {
      return NextResponse.json({ offer: null }, { status: 200 });
    }

    const offer = await prisma.loyaltyHistory.findFirst({
      where: {
        clientId: session.id,
        discountGenerated: false,
      },
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        cutsCount: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      offer: offer
        ? {
            id: offer.id,
            cutsCount: offer.cutsCount,
            discountPercent: 50,
          }
        : null,
    });
  } catch (error) {
    console.error("Erro ao consultar fidelidade:", error);
    return NextResponse.json({ offer: null });
  }
}
