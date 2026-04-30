import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const plans = await db.plan.findMany({
    where: { isActive: true },
    orderBy: { priceCents: "asc" },
  });
  return NextResponse.json(plans);
}
