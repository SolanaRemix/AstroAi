"use client";

import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { siteConfig } from "@/config/site";

export default function LandingPage() {
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session?.user) router.push("/dashboard");
  }, [session, router]);

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden py-24 px-4 text-center">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/30 via-purple-900/20 to-transparent pointer-events-none" />
        <div className="relative max-w-4xl mx-auto">
          <div className="text-6xl mb-6">✨</div>
          <h1 className="text-5xl sm:text-7xl font-extrabold mb-6">
            <span className="bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300 bg-clip-text text-transparent">
              {siteConfig.name}
            </span>
          </h1>
          <p className="text-xl sm:text-2xl text-slate-300 mb-4">
            {siteConfig.tagline}
          </p>
          <p className="text-slate-400 max-w-2xl mx-auto mb-10">
            Discover your numerology profile, read the lines of your left hand, and receive
            personalized oracle guidance for growth, purpose, and clarity.
          </p>
          <Button size="lg" onClick={() => signIn("google")}>
            Begin Your Journey — Sign in with Google
          </Button>
          <p className="mt-4 text-slate-500 text-sm">Free to explore · Premium insights available</p>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-white mb-4">
            Three Paths to Self-Discovery
          </h2>
          <p className="text-slate-400 text-center mb-12 max-w-xl mx-auto">
            Each reading is symbolic, empowering, and designed to support your personal growth.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: "🔢",
                title: "Numerology",
                description:
                  "Uncover the patterns encoded in your birth date and full name. Discover your Life Path, Destiny, Soul Urge, and Personality numbers.",
              },
              {
                icon: "🤚",
                title: "Palm Reading",
                description:
                  "Upload a photo of your left hand. Our symbolic analysis traces your life, heart, head, and fate lines.",
              },
              {
                icon: "🔮",
                title: "Oracle Guidance",
                description:
                  "Receive personalized karma insights and goal-path clarity — all framed as reflection tools, not fixed truths.",
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="bg-white/5 rounded-2xl border border-white/10 p-8 hover:border-indigo-500/40 transition-all"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing CTA */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Simple, Transparent Pricing</h2>
          <p className="text-slate-400 mb-8">
            Choose a monthly or annual plan to unlock all readings and your personal dashboard.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={() => router.push("/pricing")}>
              View Plans
            </Button>
            <Button size="lg" variant="outline" onClick={() => signIn("google")}>
              Sign In Free
            </Button>
          </div>
        </div>
      </section>

      <section className="py-10 px-4 text-center">
        <p className="text-slate-600 text-xs max-w-2xl mx-auto">
          {siteConfig.name} is for personal reflection and entertainment purposes only.
          Readings are symbolic and should not replace medical, legal, or financial advice.
        </p>
      </section>
    </div>
  );
}
