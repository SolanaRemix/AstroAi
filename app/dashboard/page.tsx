"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
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
  } | null;
  latestPalmScan?: {
    generatedSummary?: string | null;
    createdAt: string;
  } | null;
  recentInsights: Array<{
    id: string;
    theme: string;
    title: string;
    body: string;
  }>;
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [numerologyLoading, setNumerologyLoading] = useState(false);
  const [palmLoading, setPalmLoading] = useState(false);

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

  async function fetchDashboard() {
    setLoading(true);
    try {
      const res = await fetch("/api/dashboard");
      if (res.ok) {
        const json = await res.json();
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
      const res = await fetch("/api/palm/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl }),
      });
      if (res.ok) {
        await fetchDashboard();
      }
    } finally {
      setPalmLoading(false);
    }
  }

  async function handleManageSubscription() {
    const res = await fetch("/api/stripe/portal", { method: "POST" });
    if (res.ok) {
      const { url } = await res.json();
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
