"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";

interface AdminStats {
  totalUsers: number;
  activeSubscriptions: number;
  mrrCents: number;
  recentUsers: Array<{
    id: string;
    name?: string | null;
    email: string;
    role: string;
    createdAt: string;
    subscription?: { status: string; plan?: { name: string } } | null;
  }>;
}

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "users" | "plans" | "content" | "oracle" | "system">("overview");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/");
    if (status === "authenticated" && session.user.role !== "ADMIN") router.push("/dashboard");
  }, [status, session, router]);

  useEffect(() => {
    if (status === "authenticated" && session?.user?.role === "ADMIN") {
      fetch("/api/admin/stats")
        .then((r) => r.json())
        .then(setStats)
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [status, session]);

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-slate-400 animate-pulse">Loading admin dashboard…</div>
      </div>
    );
  }

  const mrr = stats ? (stats.mrrCents / 100).toFixed(2) : "—";

  const tabs = [
    { id: "overview", label: "📊 Overview" },
    { id: "users", label: "👥 Users" },
    { id: "plans", label: "💳 Plans" },
    { id: "content", label: "📝 Content" },
    { id: "oracle", label: "🔮 Oracle Rules" },
    { id: "system", label: "⚙️ System" },
  ] as const;

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
        <p className="text-slate-400 text-sm mt-1">Manage users, plans, content, and oracle rules.</p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-8 border-b border-white/10 pb-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? "bg-indigo-600 text-white"
                : "text-slate-400 hover:text-white hover:bg-white/10"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview */}
      {activeTab === "overview" && stats && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { label: "Total Users", value: stats.totalUsers, icon: "👥" },
              { label: "Active Subscriptions", value: stats.activeSubscriptions, icon: "✅" },
              { label: "MRR (est.)", value: `$${mrr}`, icon: "💰" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="bg-white/5 rounded-2xl border border-white/10 p-6"
              >
                <div className="text-2xl mb-2">{stat.icon}</div>
                <div className="text-3xl font-bold text-white">{stat.value}</div>
                <div className="text-sm text-slate-400 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>

          <div className="bg-white/5 rounded-2xl border border-white/10 p-6">
            <h2 className="text-lg font-bold text-white mb-4">Recent Sign-ups</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="text-slate-400 border-b border-white/10">
                    <th className="pb-3 font-medium">Email</th>
                    <th className="pb-3 font-medium">Role</th>
                    <th className="pb-3 font-medium">Plan</th>
                    <th className="pb-3 font-medium">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {stats.recentUsers.map((user) => (
                    <tr key={user.id} className="text-slate-300">
                      <td className="py-3">{user.email}</td>
                      <td className="py-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            user.role === "ADMIN"
                              ? "bg-purple-900/40 text-purple-300"
                              : "bg-white/10 text-slate-300"
                          }`}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className="py-3">
                        {user.subscription?.plan?.name ?? (
                          <span className="text-slate-500">None</span>
                        )}
                      </td>
                      <td className="py-3 text-slate-500">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Users tab */}
      {activeTab === "users" && <AdminUsersTab />}

      {/* Plans tab */}
      {activeTab === "plans" && <AdminPlansTab />}

      {/* Content tab */}
      {activeTab === "content" && <AdminContentTab />}

      {/* Oracle Rules tab */}
      {activeTab === "oracle" && <AdminOracleTab />}

      {/* System tab */}
      {activeTab === "system" && (
        <div className="bg-white/5 rounded-2xl border border-white/10 p-6 space-y-4">
          <h2 className="text-lg font-bold text-white">System Configuration</h2>
          <p className="text-slate-400 text-sm">Environment variable names (values are hidden):</p>
          <ul className="space-y-2 text-sm font-mono">
            {[
              "DATABASE_URL",
              "NEXTAUTH_URL",
              "NEXTAUTH_SECRET",
              "GOOGLE_CLIENT_ID",
              "GOOGLE_CLIENT_SECRET",
              "STRIPE_SECRET_KEY",
              "STRIPE_WEBHOOK_SECRET",
              "STRIPE_PRICE_MONTHLY",
              "STRIPE_PRICE_YEARLY",
              "PALM_ML_ENDPOINT (optional)",
              "AVATAR_GENERATION_ENDPOINT (optional)",
              "GEMINI_API_KEY (optional)",
            ].map((k) => (
              <li key={k} className="flex items-center gap-2">
                <span className="text-green-400">✓</span>
                <span className="text-slate-300">{k}</span>
              </li>
            ))}
          </ul>
          <div className="pt-4 flex gap-4 flex-wrap">
            <a
              href="https://dashboard.stripe.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-400 hover:text-indigo-300 text-sm underline"
            >
              Open Stripe Dashboard →
            </a>
            <a
              href="https://vercel.com/dashboard"
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-400 hover:text-indigo-300 text-sm underline"
            >
              Open Vercel Dashboard →
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function AdminUsersTab() {
  const [users, setUsers] = useState<AdminStats["recentUsers"]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/users")
      .then((r) => r.json())
      .then(setUsers)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-slate-400 animate-pulse">Loading users…</p>;

  return (
    <div className="bg-white/5 rounded-2xl border border-white/10 p-6">
      <h2 className="text-lg font-bold text-white mb-4">All Users ({users.length})</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead>
            <tr className="text-slate-400 border-b border-white/10">
              <th className="pb-3 font-medium">Email</th>
              <th className="pb-3 font-medium">Name</th>
              <th className="pb-3 font-medium">Role</th>
              <th className="pb-3 font-medium">Subscription</th>
              <th className="pb-3 font-medium">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {users.map((user) => (
              <tr key={user.id} className="text-slate-300">
                <td className="py-3">{user.email}</td>
                <td className="py-3">{user.name ?? "—"}</td>
                <td className="py-3">
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      user.role === "ADMIN"
                        ? "bg-purple-900/40 text-purple-300"
                        : "bg-white/10 text-slate-300"
                    }`}
                  >
                    {user.role}
                  </span>
                </td>
                <td className="py-3">{user.subscription?.status ?? "—"}</td>
                <td className="py-3 text-slate-500">
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AdminPlansTab() {
  interface Plan {
    id: string;
    name: string;
    slug: string;
    priceCents: number;
    currency: string;
    interval: string;
    stripePriceId: string;
    isActive: boolean;
  }
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/plans")
      .then((r) => r.json())
      .then(setPlans)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-slate-400 animate-pulse">Loading plans…</p>;

  return (
    <div className="bg-white/5 rounded-2xl border border-white/10 p-6">
      <h2 className="text-lg font-bold text-white mb-4">Plans</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead>
            <tr className="text-slate-400 border-b border-white/10">
              <th className="pb-3 font-medium">Name</th>
              <th className="pb-3 font-medium">Slug</th>
              <th className="pb-3 font-medium">Price</th>
              <th className="pb-3 font-medium">Interval</th>
              <th className="pb-3 font-medium">Stripe Price ID</th>
              <th className="pb-3 font-medium">Active</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {plans.map((plan) => (
              <tr key={plan.id} className="text-slate-300">
                <td className="py-3 font-medium">{plan.name}</td>
                <td className="py-3 text-slate-500">{plan.slug}</td>
                <td className="py-3">${(plan.priceCents / 100).toFixed(2)} {plan.currency.toUpperCase()}</td>
                <td className="py-3">{plan.interval}</td>
                <td className="py-3 font-mono text-xs text-slate-500">{plan.stripePriceId}</td>
                <td className="py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs ${plan.isActive ? "bg-green-900/40 text-green-300" : "bg-red-900/40 text-red-300"}`}>
                    {plan.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AdminContentTab() {
  interface ContentItem {
    id: string;
    title: string;
    type: string;
    visibility: string;
    publishedAt?: string | null;
  }
  const [content, setContent] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/content")
      .then((r) => r.json())
      .then(setContent)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-slate-400 animate-pulse">Loading content…</p>;

  return (
    <div className="bg-white/5 rounded-2xl border border-white/10 p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold text-white">Content ({content.length})</h2>
      </div>
      {content.length === 0 ? (
        <p className="text-slate-500 text-sm">No content yet. Add some via the API or seed.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="text-slate-400 border-b border-white/10">
                <th className="pb-3 font-medium">Title</th>
                <th className="pb-3 font-medium">Type</th>
                <th className="pb-3 font-medium">Visibility</th>
                <th className="pb-3 font-medium">Published</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {content.map((item) => (
                <tr key={item.id} className="text-slate-300">
                  <td className="py-3">{item.title}</td>
                  <td className="py-3">{item.type}</td>
                  <td className="py-3">{item.visibility}</td>
                  <td className="py-3 text-slate-500">
                    {item.publishedAt ? new Date(item.publishedAt).toLocaleDateString() : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function AdminOracleTab() {
  interface OracleRule {
    id: string;
    name: string;
    ruleType: string;
    isActive: boolean;
    description?: string | null;
  }
  const [rules, setRules] = useState<OracleRule[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/oracle-rules")
      .then((r) => r.json())
      .then(setRules)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-slate-400 animate-pulse">Loading oracle rules…</p>;

  return (
    <div className="bg-white/5 rounded-2xl border border-white/10 p-6">
      <h2 className="text-lg font-bold text-white mb-4">Oracle Rules ({rules.length})</h2>
      <div className="space-y-4">
        {rules.map((rule) => (
          <div key={rule.id} className="bg-white/5 rounded-xl p-4 border border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-medium text-white">{rule.name}</span>
                <span className={`ml-3 px-2 py-0.5 rounded-full text-xs ${
                  rule.ruleType === "numerology"
                    ? "bg-blue-900/40 text-blue-300"
                    : rule.ruleType === "palm"
                    ? "bg-green-900/40 text-green-300"
                    : "bg-purple-900/40 text-purple-300"
                }`}>
                  {rule.ruleType}
                </span>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-xs ${rule.isActive ? "bg-green-900/40 text-green-300" : "bg-red-900/40 text-red-300"}`}>
                {rule.isActive ? "Active" : "Inactive"}
              </span>
            </div>
            {rule.description && (
              <p className="text-slate-400 text-xs mt-1">{rule.description}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
