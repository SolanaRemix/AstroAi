import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { analyzeCelestial } from "@/lib/celestial";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await db.user.findUnique({ where: { email: session.user.email } });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const body = await req.json();
  const { dateOfBirth, timeOfBirth, placeOfBirth, palmScanId } = body as {
    dateOfBirth: string;
    timeOfBirth?: string;
    placeOfBirth?: string;
    palmScanId?: string;
  };

  if (!dateOfBirth) {
    return NextResponse.json({ error: "Missing dateOfBirth" }, { status: 400 });
  }

  // Validate dateOfBirth is a parseable date
  if (isNaN(new Date(dateOfBirth).getTime())) {
    return NextResponse.json({ error: "Invalid dateOfBirth — must be a valid date string (e.g. YYYY-MM-DD)" }, { status: 400 });
  }

  // Verify palmScanId belongs to the current user (prevent cross-user data linkage)
  let resolvedPalmScanId: string | null = null;
  if (palmScanId) {
    const palmScan = await db.palmScan.findUnique({ where: { id: palmScanId } });
    if (!palmScan || palmScan.userId !== user.id) {
      return NextResponse.json({ error: "Palm scan not found" }, { status: 404 });
    }
    resolvedPalmScanId = palmScanId;
  }

  const result = analyzeCelestial({
    dateOfBirth,
    timeOfBirth,
    placeOfBirth,
    userId: user.id,
  });

  // Store the celestial insight
  const celestialInsight = await db.celestialInsight.create({
    data: {
      userId: user.id,
      palmScanId: resolvedPalmScanId,
      dateOfBirth,
      timeOfBirth: timeOfBirth ?? null,
      placeOfBirth: placeOfBirth ?? null,
      sunSign: result.sunSign,
      moonSign: result.moonSign,
      risingSign: result.risingSign,
      themes: result.themes,
      generatedSummary: result.generatedSummary,
    },
  });

  // Advance onboarding to step 4 if not yet complete
  if (!user.onboardingComplete) {
    await db.user.update({
      where: { id: user.id },
      data: {
        onboardingStep: 4,
      },
    });
  }

  return NextResponse.json({ celestialInsight, result });
}
