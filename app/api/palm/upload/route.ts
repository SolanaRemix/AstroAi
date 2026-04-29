import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { analyzePalmImage } from "@/lib/palm";
import { generateOracleInsights } from "@/lib/oracle";

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
  const { imageUrl } = body as { imageUrl: string };

  if (!imageUrl) {
    return NextResponse.json({ error: "Missing imageUrl" }, { status: 400 });
  }

  // Analyze palm image
  const result = await analyzePalmImage({ imageUrl, userId: user.id });

  // Store palm scan
  const palmScan = await db.palmScan.create({
    data: {
      userId: user.id,
      imageUrl,
      hand: "left",
      extractedLines: result.extractedLines as object[],
      modelVersion: result.modelVersion,
      generatedSummary: result.generatedSummary,
    },
  });

  // Fetch user's numerology profile for combined insights
  const numerologyProfile = await db.numerologyProfile.findUnique({
    where: { userId: user.id },
  });

  // Generate oracle insights from palm + numerology
  const rules = await db.oracleRule.findMany({ where: { isActive: true } });
  const insightResults = generateOracleInsights({
    numerologyProfile,
    palmScan,
    rules,
  });

  // Store insights
  for (const insight of insightResults) {
    await db.oracleInsight.create({
      data: {
        userId: user.id,
        palmScanId: palmScan.id,
        numerologyProfileId: numerologyProfile?.id,
        theme: insight.theme,
        title: insight.title,
        body: insight.body,
      },
    });
  }

  return NextResponse.json({ palmScan, insights: insightResults });
}
