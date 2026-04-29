import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await db.user.findUnique({
    where: { email: session.user.email },
    include: {
      subscriptions: {
        include: { plan: true },
        orderBy: { createdAt: "desc" },
        take: 1,
      },
      numerologyProfile: {
        select: {
          id: true,
          lifePathNumber: true,
          destinyNumber: true,
          soulUrgeNumber: true,
          personalityNumber: true,
          generatedSummary: true,
          birthDate: true,
          createdAt: true,
        },
      },
      palmScans: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
      oracleInsights: {
        orderBy: { createdAt: "desc" },
        take: 6,
      },
    },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({
    subscription: user.subscriptions[0] ?? null,
    numerologyProfile: user.numerologyProfile ?? null,
    latestPalmScan: user.palmScans[0] ?? null,
    recentInsights: user.oracleInsights,
  });
}
