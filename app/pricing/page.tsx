"use client";

import { useEffect, useState } from "react";
import { useSession, signIn } from "next-auth/react";
import { PlanCard } from "@/components/PlanCard";

interface Plan {
  id: string;
  name: string;
  slug: string;
  priceCents: number;
  currency: string;
  interval: string;
  isActive: boolean;
}

export default function PricingPage() {
  const { data: session } = useSession();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState<string | null>(null);
  const [currentPlanId, setCurrentPlanId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/plans").then((r) => r.json()).then(setPlans).catch(console.error);
    if (session?.user) {
      fetch("/api/dashboard")
        .then((r) => r.json())
        .then((d) => setCurrentPlanId(d?.subscription?.planId ?? null))
        .catch(console.error);
    }
  }, [session]);

  async function handleSubscribe(planId: string) {
    if (!session?.user) {
      signIn("google");
      return;
    }
    setLoading(planId);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId }),
      });
      if (res.ok) {
        const { url } = await res.json();
        window.location.href = url;
      }
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-16">
      <div className="text-center mb-14">
        <h1 className="text-4xl font-extrabold text-white mb-4">Choose Your Plan</h1>
        <p className="text-slate-400 max-w-xl mx-auto">
          Unlock your full numerology profile, palm reading, and oracle guidance. Cancel anytime.
        </p>
      </div>

      {plans.length === 0 ? (
        <p className="text-center text-slate-500 py-12">Loading plans…</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {plans.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              isCurrentPlan={currentPlanId === plan.id}
              onSubscribe={handleSubscribe}
              loading={loading === plan.id}
            />
          ))}
        </div>
      )}

      <p className="mt-10 text-center text-slate-600 text-xs">
        Secure payments via Stripe. Cancel anytime from your dashboard.
        For entertainment purposes only — not medical or financial advice.
      </p>
    </div>
  );
}
