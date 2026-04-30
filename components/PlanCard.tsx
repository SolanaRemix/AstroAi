import { Button } from "@/components/ui/Button";

interface Plan {
  id: string;
  name: string;
  slug: string;
  priceCents: number;
  currency: string;
  interval: string;
  isActive: boolean;
}

interface PlanCardProps {
  plan: Plan;
  isCurrentPlan?: boolean;
  onSubscribe?: (planId: string) => void;
  loading?: boolean;
}

export function PlanCard({ plan, isCurrentPlan, onSubscribe, loading }: PlanCardProps) {
  const price = (plan.priceCents / 100).toFixed(2);
  const intervalLabel = plan.interval === "year" ? "yr" : "mo";
  const isPopular = plan.interval === "month";

  return (
    <div
      className={`relative bg-white/5 rounded-2xl border p-8 flex flex-col gap-6 transition-all ${
        isPopular ? "border-indigo-500/60 shadow-lg shadow-indigo-900/40" : "border-white/10"
      }`}
    >
      {isPopular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-bold px-4 py-1 rounded-full">
          POPULAR
        </div>
      )}

      <div>
        <h3 className="text-xl font-bold text-white">{plan.name}</h3>
        <div className="mt-2 flex items-baseline gap-1">
          <span className="text-4xl font-extrabold text-white">
            {plan.currency === "usd" ? "$" : plan.currency.toUpperCase()}{price}
          </span>
          <span className="text-slate-400 text-sm">/{intervalLabel}</span>
        </div>
      </div>

      <ul className="space-y-2 text-sm text-slate-300 flex-1">
        <li className="flex items-center gap-2">
          <span className="text-green-400">✓</span> Full numerology profile
        </li>
        <li className="flex items-center gap-2">
          <span className="text-green-400">✓</span> Palm reading (left hand)
        </li>
        <li className="flex items-center gap-2">
          <span className="text-green-400">✓</span> Oracle insights (karma & guidance)
        </li>
        <li className="flex items-center gap-2">
          <span className="text-green-400">✓</span> Past life narratives
        </li>
        {plan.interval === "year" && (
          <li className="flex items-center gap-2">
            <span className="text-green-400">✓</span>
            <strong className="text-indigo-300">2 months free</strong> vs monthly
          </li>
        )}
      </ul>

      {isCurrentPlan ? (
        <div className="bg-green-900/30 border border-green-500/30 rounded-lg px-4 py-2.5 text-center text-green-300 text-sm font-medium">
          ✓ Current Plan
        </div>
      ) : (
        <Button
          className="w-full"
          disabled={loading}
          onClick={() => onSubscribe?.(plan.id)}
        >
          {loading ? "Redirecting…" : "Subscribe"}
        </Button>
      )}
    </div>
  );
}
