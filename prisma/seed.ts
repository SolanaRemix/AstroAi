import { PrismaClient, type Prisma } from "@prisma/client";
import { initialOracleRules } from "../config/oracleRules";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database…");

  // Seed plans
  const monthlyPriceId = process.env.STRIPE_PRICE_MONTHLY;
  const yearlyPriceId = process.env.STRIPE_PRICE_YEARLY;

  if (!monthlyPriceId || !yearlyPriceId) {
    console.warn(
      "⚠️  STRIPE_PRICE_MONTHLY and/or STRIPE_PRICE_YEARLY are not set.\n" +
        "   Plans will be seeded with placeholder price IDs that CANNOT be used for Stripe Checkout.\n" +
        "   Set these env vars before seeding a production database."
    );
  }

  const resolvedMonthlyPriceId = monthlyPriceId ?? "price_monthly_placeholder";
  const resolvedYearlyPriceId = yearlyPriceId ?? "price_yearly_placeholder";

  const monthly = await prisma.plan.upsert({
    where: { slug: "monthly" },
    update: {
      stripePriceId: resolvedMonthlyPriceId,
      priceCents: 1499,
      isActive: true,
    },
    create: {
      name: "AstroLife Monthly",
      slug: "monthly",
      priceCents: 1499,
      currency: "usd",
      interval: "month",
      stripePriceId: resolvedMonthlyPriceId,
      isActive: true,
    },
  });
  console.log(`✅ Plan: ${monthly.name}`);

  const yearly = await prisma.plan.upsert({
    where: { slug: "yearly" },
    update: {
      stripePriceId: resolvedYearlyPriceId,
      priceCents: 11999,
      isActive: true,
    },
    create: {
      name: "AstroLife Yearly",
      slug: "yearly",
      priceCents: 11999,
      currency: "usd",
      interval: "year",
      stripePriceId: resolvedYearlyPriceId,
      isActive: true,
    },
  });
  console.log(`✅ Plan: ${yearly.name}`);

  // Seed oracle rules
  for (const rule of initialOracleRules) {
    const existing = await prisma.oracleRule.findFirst({ where: { name: rule.name } });
    if (!existing) {
      await prisma.oracleRule.create({
        data: {
          name: rule.name,
          description: rule.description,
          ruleType: rule.ruleType,
          conditions: rule.conditions as Prisma.InputJsonValue,
          template: rule.template,
          isActive: rule.isActive,
        },
      });
      console.log(`✅ Oracle rule: ${rule.name}`);
    } else {
      console.log(`⏭️  Oracle rule already exists: ${rule.name}`);
    }
  }

  console.log("✅ Seed complete!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
