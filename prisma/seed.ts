import { PrismaClient, type Prisma } from "@prisma/client";
import { initialOracleRules } from "../config/oracleRules";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database…");

  // Seed plans
  const monthlyPriceId = process.env.STRIPE_PRICE_MONTHLY ?? "price_monthly_placeholder";
  const yearlyPriceId = process.env.STRIPE_PRICE_YEARLY ?? "price_yearly_placeholder";

  const monthly = await prisma.plan.upsert({
    where: { slug: "monthly" },
    update: {},
    create: {
      name: "AstroLife Monthly",
      slug: "monthly",
      priceCents: 1499,
      currency: "usd",
      interval: "month",
      stripePriceId: monthlyPriceId,
      isActive: true,
    },
  });
  console.log(`✅ Plan: ${monthly.name}`);

  const yearly = await prisma.plan.upsert({
    where: { slug: "yearly" },
    update: {},
    create: {
      name: "AstroLife Yearly",
      slug: "yearly",
      priceCents: 11999,
      currency: "usd",
      interval: "year",
      stripePriceId: yearlyPriceId,
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
