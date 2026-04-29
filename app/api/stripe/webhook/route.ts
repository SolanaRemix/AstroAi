import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/db";
import type Stripe from "stripe";

export async function POST(req: Request) {
  const body = await req.text();
  const headersList = await headers();
  const signature = headersList.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const checkoutSession = event.data.object as Stripe.Checkout.Session;
        if (checkoutSession.mode !== "subscription") break;

        const userId = checkoutSession.metadata?.userId;
        const planId = checkoutSession.metadata?.planId;
        const stripeSubscriptionId = checkoutSession.subscription as string;
        const stripeCustomerId = checkoutSession.customer as string;

        if (!userId || !planId) break;

        const stripeSubscription = await stripe.subscriptions.retrieve(stripeSubscriptionId, {
          expand: ["items"],
        });

        const item = stripeSubscription.items.data[0];
        const periodStart = item?.current_period_start ?? null;
        const periodEnd = item?.current_period_end ?? null;

        await db.subscription.upsert({
          where: { stripeSubscriptionId },
          update: {
            status: "active",
            currentPeriodStart: periodStart ? new Date(periodStart * 1000) : null,
            currentPeriodEnd: periodEnd ? new Date(periodEnd * 1000) : null,
          },
          create: {
            userId,
            planId,
            stripeCustomerId,
            stripeSubscriptionId,
            status: "active",
            currentPeriodStart: periodStart ? new Date(periodStart * 1000) : null,
            currentPeriodEnd: periodEnd ? new Date(periodEnd * 1000) : null,
          },
        });

        await db.systemLog.create({
          data: {
            type: "subscription_created",
            message: `Subscription created for user ${userId}`,
            meta: { stripeSubscriptionId, planId },
          },
        });
        break;
      }

      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        const statusMap: Record<string, string> = {
          active: "active",
          canceled: "canceled",
          past_due: "past_due",
          trialing: "trialing",
          incomplete: "inactive",
          incomplete_expired: "inactive",
          unpaid: "past_due",
          paused: "inactive",
        };

        const item = sub.items.data[0];
        const periodStart = item?.current_period_start ?? null;
        const periodEnd = item?.current_period_end ?? null;

        await db.subscription.update({
          where: { stripeSubscriptionId: sub.id },
          data: {
            status: (statusMap[sub.status] ?? "inactive") as "active" | "canceled" | "past_due" | "trialing" | "inactive",
            currentPeriodStart: periodStart ? new Date(periodStart * 1000) : null,
            currentPeriodEnd: periodEnd ? new Date(periodEnd * 1000) : null,
          },
        });
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        await db.subscription.update({
          where: { stripeSubscriptionId: sub.id },
          data: { status: "canceled" },
        });
        break;
      }
    }
  } catch (err) {
    console.error("Webhook error:", err);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
