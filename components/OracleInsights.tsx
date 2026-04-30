interface OracleInsight {
  id?: string;
  theme: string;
  title: string;
  body: string;
  createdAt?: string | Date;
}

interface OracleInsightsProps {
  insights: OracleInsight[];
}

const THEME_ICONS: Record<string, string> = {
  past_life: "🌀",
  karma: "⚖️",
  guidance: "🌟",
  goal_path: "🗺️",
};

const THEME_LABELS: Record<string, string> = {
  past_life: "Past Life",
  karma: "Karma",
  guidance: "Guidance",
  goal_path: "Goal Path",
};

export function OracleInsights({ insights }: OracleInsightsProps) {
  if (!insights.length) return null;

  return (
    <div className="bg-white/5 rounded-2xl border border-white/10 p-6">
      <h2 className="text-xl font-bold text-white mb-2">🔮 Oracle Insights</h2>
      <p className="text-slate-400 text-sm mb-6">
        Symbolic reflections for personal growth. These are not predictions — they are mirrors
        for your own wisdom.
      </p>
      <div className="space-y-4">
        {insights.map((insight, i) => (
          <div
            key={insight.id ?? i}
            className="bg-gradient-to-br from-indigo-900/30 to-purple-900/30 rounded-xl p-5 border border-indigo-500/20"
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">{THEME_ICONS[insight.theme] ?? "✨"}</span>
              <span className="text-xs font-medium text-indigo-300 uppercase tracking-wide">
                {THEME_LABELS[insight.theme] ?? insight.theme}
              </span>
            </div>
            <h3 className="text-white font-semibold mb-2">{insight.title}</h3>
            <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-line">
              {insight.body}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
