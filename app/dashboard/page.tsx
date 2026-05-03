"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { NumerologyCard } from "@/components/NumerologyCard";
import { PalmUpload } from "@/components/PalmUpload";
import { OracleInsights } from "@/components/OracleInsights";
import { Button } from "@/components/ui/Button";

interface DashboardData {
  subscription?: {
    status: string;
    currentPeriodEnd?: string;
    plan?: { name: string };
  } | null;
  numerologyProfile?: {
    lifePathNumber: number;
    destinyNumber: number;
    soulUrgeNumber: number;
    personalityNumber: number;
    generatedSummary?: string | null;
    birthDate?: string | null;
  } | null;
  latestPalmScan?: {
    id?: string;
    generatedSummary?: string | null;
    createdAt: string;
  } | null;
  recentInsights: Array<{
    id: string;
    theme: string;
    title: string;
    body: string;
  }>;
  latestCelestialInsight?: {
    sunSign?: string | null;
    moonSign?: string | null;
    risingSign?: string | null;
    themes?: string[] | null;
    generatedSummary?: string | null;
    createdAt: string;
  } | null;
  onboardingStep: number;
  onboardingComplete: boolean;
}

interface DeepAnalysis {
  sunSign: string;
  moonSign: string;
  risingSign: string;
  themes: string[];
  generatedSummary: string;
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [numerologyLoading, setNumerologyLoading] = useState(false);
  const [palmLoading, setPalmLoading] = useState(false);
  // deepAnalysis: undefined = not triggered, null = loading, object = complete
  const [deepAnalysis, setDeepAnalysis] = useState<DeepAnalysis | null | undefined>(undefined);
  const dismissTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      fetchDashboard();
    }
  }, [status]);

  // Auto-dismiss deep analysis card 6 s after data arrives
  useEffect(() => {
    if (deepAnalysis !== null && deepAnalysis !== undefined) {
      dismissTimer.current = setTimeout(() => {
        setDeepAnalysis(undefined);
      }, 6000);
    }
    return () => {
      if (dismissTimer.current) clearTimeout(dismissTimer.current);
    };
  }, [deepAnalysis]);

  async function fetchDashboard() {
    setLoading(true);
    try {
      const res = await fetch("/api/dashboard");
      if (res.ok) {
        const json = await res.json() as DashboardData;
        setData(json);
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleNumerologySubmit(formData: { birthDate: string; fullName: string }) {
    setNumerologyLoading(true);
    try {
      const res = await fetch("/api/numerology/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        await fetchDashboard();
      }
    } finally {
      setNumerologyLoading(false);
    }
  }

  async function handlePalmUpload(imageUrl: string) {
    setPalmLoading(true);
    try {
      // Step 1: analyzePalmImage via palm upload API
      const palmRes = await fetch("/api/palm/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl }),
      });

      if (!palmRes.ok) return;

      const palmData = await palmRes.json() as { palmScan?: { id?: string } };
      const palmScanId = palmData.palmScan?.id;

      // Step 2: analyzeCelestial(DOB, TOB, POB) — uses birth date from numerology profile
      const dob = data?.numerologyProfile?.birthDate;
      if (dob) {
        setDeepAnalysis(null); // Enter loading state: "Calculating deep karmic synthesis..."

        const celestialRes = await fetch("/api/celestial/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          // Step 3: Store celestial insights linked to this palm scan
          body: JSON.stringify({
            dateOfBirth: dob,
            palmScanId: palmScanId ?? null,
          }),
        });

        if (celestialRes.ok) {
          const celestialData = await celestialRes.json() as { result?: DeepAnalysis };
          // Step 4: If onboardingComplete === false, server sets onboardingStep → 4 in /api/celestial/analyze
          // Auto-dismiss once data arrives (useEffect watches this)
          setDeepAnalysis(celestialData.result ?? null);
        } else {
          // Reset loading state if celestial call fails
          setDeepAnalysis(undefined);
        }
      }

      await fetchDashboard();
    } finally {
      setPalmLoading(false);
    }
  }

  async function handleManageSubscription() {
    const res = await fetch("/api/stripe/portal", { method: "POST" });
    if (res.ok) {
      const { url } = await res.json() as { url: string };
      window.location.href = url;
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-slate-400 animate-pulse">Loading your cosmic profile…</div>
      </div>
    );
  }

  if (!session?.user) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-10">
        <div className="flex items-center gap-4">
          {session.user.image && (
            <img
              src={session.user.image}
              alt={session.user.name ?? "User"}
              className="w-14 h-14 rounded-full border-2 border-indigo-500/50"
            />
          )}
          <div>
            <h1 className="text-2xl font-bold text-white">
              Welcome, {session.user.name?.split(" ")[0] ?? "Explorer"} ✨
            </h1>
            {data?.subscription ? (
              <p className="text-sm text-indigo-300">
                {data.subscription.plan?.name} · {data.subscription.status}
                {data.subscription.currentPeriodEnd &&
                  ` · Renews ${new Date(data.subscription.currentPeriodEnd).toLocaleDateString()}`}
              </p>
            ) : (
              <p className="text-sm text-slate-500">No active subscription</p>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          {data?.subscription?.status === "active" && (
            <Button variant="outline" size="sm" onClick={handleManageSubscription}>
              Manage Subscription
            </Button>
          )}
          {!data?.subscription && (
            <Button size="sm" onClick={() => router.push("/pricing")}>
              Upgrade Plan
            </Button>
          )}
        </div>
      </div>

      {/* Onboarding progress */}
      {data && !data.onboardingComplete && (
        <div className="mb-8 bg-indigo-900/20 border border-indigo-500/20 rounded-2xl p-5">
          <p className="text-indigo-300 text-sm font-medium mb-3">
            🌟 Setup Progress — Step {data.onboardingStep} of 4
          </p>
          <div className="flex gap-2">
            {[
              { step: 1, label: "Account" },
              { step: 2, label: "Numerology" },
              { step: 3, label: "Palm Scan" },
              { step: 4, label: "Celestial" },
            ].map(({ step, label }) => (
              <div key={step} className="flex-1 text-center">
                <div
                  className={`h-1.5 rounded-full mb-1 ${
                    data.onboardingStep >= step ? "bg-indigo-500" : "bg-white/10"
                  }`}
                />
                <span className="text-xs text-slate-400">{label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Deep karmic synthesis loading state — shown when deepAnalysis === null */}
      {deepAnalysis === null && (
        <div className="mb-8 bg-purple-900/20 border border-purple-500/30 rounded-2xl p-6 flex items-center gap-4">
          <div className="shrink-0 w-6 h-6 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
          <div>
            <p className="text-purple-300 font-medium">Calculating deep karmic synthesis…</p>
            <p className="text-slate-400 text-sm mt-0.5">
              Weaving your celestial, numerology, and palm data into unified insights.
            </p>
          </div>
        </div>
      )}

      {/* Deep analysis result — auto-dismisses 6 s after data arrives */}
      {deepAnalysis !== null && deepAnalysis !== undefined && (
        <div className="mb-8 bg-purple-900/20 border border-purple-500/30 rounded-2xl p-6">
          <h2 className="text-lg font-bold text-white mb-2">🔮 Celestial Synthesis</h2>
          <div className="flex flex-wrap gap-3 mb-4">
            {[
              { label: "Sun", value: deepAnalysis.sunSign },
              { label: "Moon", value: deepAnalysis.moonSign },
              { label: "Rising", value: deepAnalysis.risingSign },
            ].map((item) => (
              <div
                key={item.label}
                className="bg-purple-900/40 border border-purple-500/20 rounded-xl px-4 py-2 text-center"
              >
                <div className="text-xs text-slate-400">{item.label}</div>
                <div className="text-white font-semibold">{item.value}</div>
              </div>
            ))}
          </div>
          <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-line">
            {deepAnalysis.generatedSummary}
          </p>
        </div>
      )}

      {/* Persisted celestial insight (from DB after page refresh) */}
      {deepAnalysis === undefined && data?.latestCelestialInsight && (
        <div className="mb-8 bg-purple-900/20 border border-purple-500/30 rounded-2xl p-6">
          <h2 className="text-lg font-bold text-white mb-2">🔮 Celestial Profile</h2>
          <div className="flex flex-wrap gap-3 mb-4">
            {[
              { label: "Sun", value: data.latestCelestialInsight.sunSign },
              { label: "Moon", value: data.latestCelestialInsight.moonSign },
              { label: "Rising", value: data.latestCelestialInsight.risingSign },
            ].map(
              (item) =>
                item.value && (
                  <div
                    key={item.label}
                    className="bg-purple-900/40 border border-purple-500/20 rounded-xl px-4 py-2 text-center"
                  >
                    <div className="text-xs text-slate-400">{item.label}</div>
                    <div className="text-white font-semibold">{item.value}</div>
                  </div>
                )
            )}
          </div>
          {data.latestCelestialInsight.generatedSummary && (
            <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-line">
              {data.latestCelestialInsight.generatedSummary}
            </p>
          )}
        </div>
      )}

      {/* Content */}
      <div className="space-y-8">
        <NumerologyCard
          profile={data?.numerologyProfile}
          onSubmit={handleNumerologySubmit}
          loading={numerologyLoading}
        />

        <PalmUpload
          latestScan={data?.latestPalmScan}
          onUpload={handlePalmUpload}
          loading={palmLoading}
        />

        {data?.recentInsights && data.recentInsights.length > 0 && (
          <OracleInsights insights={data.recentInsights} />
        )}
      </div>
    </div>
  );
}
