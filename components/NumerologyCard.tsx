"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";

interface NumerologyCardProps {
  profile?: {
    lifePathNumber: number;
    destinyNumber: number;
    soulUrgeNumber: number;
    personalityNumber: number;
    generatedSummary?: string | null;
  } | null;
  onSubmit: (data: { birthDate: string; fullName: string }) => Promise<void>;
  loading?: boolean;
}

export function NumerologyCard({ profile, onSubmit, loading }: NumerologyCardProps) {
  const [birthDate, setBirthDate] = useState("");
  const [fullName, setFullName] = useState("");

  if (profile) {
    return (
      <div className="bg-white/5 rounded-2xl border border-white/10 p-6">
        <h2 className="text-xl font-bold text-white mb-4">🔢 Your Numerology Profile</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            { label: "Life Path", value: profile.lifePathNumber },
            { label: "Destiny", value: profile.destinyNumber },
            { label: "Soul Urge", value: profile.soulUrgeNumber },
            { label: "Personality", value: profile.personalityNumber },
          ].map((item) => (
            <div
              key={item.label}
              className="bg-indigo-900/40 rounded-xl p-4 text-center border border-indigo-500/30"
            >
              <div className="text-3xl font-bold text-indigo-300">{item.value}</div>
              <div className="text-xs text-slate-400 mt-1">{item.label}</div>
            </div>
          ))}
        </div>
        {profile.generatedSummary && (
          <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-line">
            {profile.generatedSummary}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white/5 rounded-2xl border border-white/10 p-6">
      <h2 className="text-xl font-bold text-white mb-2">🔢 Numerology Profile</h2>
      <p className="text-slate-400 text-sm mb-6">
        Enter your full birth name and date of birth to generate your personal numerology reading.
      </p>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          await onSubmit({ birthDate, fullName });
        }}
        className="space-y-4"
      >
        <div>
          <label className="block text-sm text-slate-300 mb-1">Full Name (as on birth certificate)</label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            placeholder="e.g. Jane Elizabeth Smith"
            className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="block text-sm text-slate-300 mb-1">Date of Birth</label>
          <input
            type="date"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
            required
            className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Generating…" : "Generate My Reading"}
        </Button>
      </form>
    </div>
  );
}
