import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  calculateLifePath,
  calculateDestiny,
  calculateSoulUrge,
  calculatePersonality,
  generateNumerologySummary,
} from "@/lib/numerology";
import { generateOracleInsights } from "@/lib/oracle";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { birthDate, fullName } = body as { birthDate: string; fullName: string };

  if (!birthDate || !fullName) {
    return NextResponse.json({ error: "Missing birthDate or fullName" }, { status: 400 });
  }

  const user = await db.user.findUnique({ where: { email: session.user.email } });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const date = new Date(birthDate);
  const lifePathNumber = calculateLifePath(date);
  const destinyNumber = calculateDestiny(fullName);
  const soulUrgeNumber = calculateSoulUrge(fullName);
  const personalityNumber = calculatePersonality(fullName);

  const rawData = { birthDate, fullName };
  const generatedSummary = generateNumerologySummary({
    lifePathNumber,
    destinyNumber,
    soulUrgeNumber,
    personalityNumber,
  });

  // Upsert (one profile per user; regenerate if re-submitted)
  const profile = await db.numerologyProfile.upsert({
    where: { userId: user.id },
    update: {
      birthDate: date,
      lifePathNumber,
      destinyNumber,
      soulUrgeNumber,
      personalityNumber,
      rawData,
      generatedSummary,
    },
    create: {
      userId: user.id,
      birthDate: date,
      lifePathNumber,
      destinyNumber,
      soulUrgeNumber,
      personalityNumber,
      rawData,
      generatedSummary,
    },
  });

  // Generate oracle insights from numerology
  const rules = await db.oracleRule.findMany({ where: { isActive: true } });
  const insightResults = generateOracleInsights({
    numerologyProfile: profile,
    rules,
  });

  // Store oracle insights
  for (const insight of insightResults) {
    await db.oracleInsight.create({
      data: {
        userId: user.id,
        numerologyProfileId: profile.id,
        theme: insight.theme,
        title: insight.title,
        body: insight.body,
      },
    });
  }

  return NextResponse.json({ profile, insights: insightResults });
}
