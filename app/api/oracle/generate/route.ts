import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { generateOracleInsights } from "@/lib/oracle";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await db.user.findUnique({
    where: { email: session.user.email },
    include: {
      numerologyProfile: true,
      palmScans: { orderBy: { createdAt: "desc" }, take: 1 },
    },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const body = await req.json();
  const { templateSlug } = body as { templateSlug?: string };

  // Fetch active oracle rules (and optionally a specific template)
  const rules = await db.oracleRule.findMany({ where: { isActive: true } });

  let templateBody: string | null = null;
  if (templateSlug) {
    const template = await db.oracleTemplate.findUnique({ where: { slug: templateSlug } });
    if (template?.isActive) {
      templateBody = template.promptTemplate;
    }
  }

  const latestPalmScan = user.palmScans[0] ?? null;

  const insightResults = generateOracleInsights({
    numerologyProfile: user.numerologyProfile ?? null,
    palmScan: latestPalmScan,
    rules,
  });

  // Persist new insights
  const saved = await Promise.all(
    insightResults.map((insight) =>
      db.oracleInsight.create({
        data: {
          userId: user.id,
          numerologyProfileId: user.numerologyProfile?.id ?? null,
          palmScanId: latestPalmScan?.id ?? null,
          theme: insight.theme,
          title: insight.title,
          body: insight.body,
        },
      })
    )
  );

  return NextResponse.json({
    insights: saved,
    templateUsed: templateBody ?? null,
  });
}
