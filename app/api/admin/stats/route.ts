import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { Role } from "@prisma/client";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return null;
  const user = await db.user.findUnique({ where: { email: session.user.email } });
  if (!user || user.role !== Role.ADMIN) return null;
  return user;
}

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const [totalUsers, activeSubscriptions, activeSubs, recentUsers] = await Promise.all([
    db.user.count(),
    db.subscription.count({ where: { status: "active" } }),
    db.subscription.findMany({
      where: { status: "active" },
      include: { plan: { select: { priceCents: true, interval: true } } },
    }),
    db.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      include: {
        subscriptions: {
          take: 1,
          orderBy: { createdAt: "desc" },
          include: { plan: { select: { name: true } } },
        },
      },
    }),
  ]);

  // Normalize yearly plans to monthly equivalent for MRR estimate
  const mrrCents = activeSubs.reduce((sum, sub) => {
    if (!sub.plan) return sum;
    const monthly =
      sub.plan.interval === "year"
        ? Math.round(sub.plan.priceCents / 12)
        : sub.plan.priceCents;
    return sum + monthly;
  }, 0);

  return NextResponse.json({
    totalUsers,
    activeSubscriptions,
    mrrCents,
    recentUsers: recentUsers.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      createdAt: u.createdAt,
      subscription: u.subscriptions[0] ?? null,
    })),
  });
}
