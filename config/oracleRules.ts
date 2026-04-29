// Initial seed oracle rules — these are loaded into the DB on first seed

interface OracleRuleSeed {
  name: string;
  description: string | null;
  ruleType: "numerology" | "palm" | "combined";
  conditions: Record<string, unknown>;
  template: string;
  isActive: boolean;
}

export const initialOracleRules: OracleRuleSeed[] = [
  {
    name: "The Leader's Journey",
    description: "For life path 1 and 8 — themes of leadership and responsibility",
    ruleType: "numerology",
    conditions: { lifePathNumbers: [1, 8] },
    template:
      "Your Life Path {{lifePathNumber}} carries the signature of {{themeKeywords}}. " +
      "You are here to lead — but leadership that lasts is built on service, not control. " +
      "Your karmic invitation is to channel your considerable strength toward lifting others. " +
      "Practical step: identify one situation this week where you can share credit or ask for input.",
    isActive: true,
  },
  {
    name: "The Compassionate Heart",
    description: "For life path 2, 6, 9 — themes of love, service, and compassion",
    ruleType: "numerology",
    conditions: { lifePathNumbers: [2, 6, 9] },
    template:
      "Life Path {{lifePathNumber}} brings the gift of {{themeKeywords}} — and the challenge of {{growthThemes}}. " +
      "Your heart is vast, and you're learning to give from fullness rather than depletion. " +
      "This week: practice one act of self-care you've been postponing, and notice how it changes your capacity to give.",
    isActive: true,
  },
  {
    name: "The Creative Seeker",
    description: "For life path 3, 5, 7 — themes of creativity, freedom, and wisdom",
    ruleType: "numerology",
    conditions: { lifePathNumbers: [3, 5, 7] },
    template:
      "Your {{lifePathNumber}} energy resonates with {{themeKeywords}}. " +
      "You are wired to explore, create, and question. Your growth edge lies in {{growthThemes}}. " +
      "Consider: what creative project or question has been calling you lately? Start with just 15 minutes today.",
    isActive: true,
  },
  {
    name: "The Builder's Path",
    description: "For life path 4, 22 — themes of structure, mastery, and endurance",
    ruleType: "numerology",
    conditions: { lifePathNumbers: [4, 22] },
    template:
      "Life Path {{lifePathNumber}} is the path of {{themeKeywords}}. " +
      "You build things that last — systems, relationships, legacies. " +
      "Your current invitation is to embrace {{growthThemes}} without losing your signature reliability. " +
      "Practical reflection: where are you gripping too tightly? What would ease look like?",
    isActive: true,
  },
  {
    name: "Strong Life Line Vitality",
    description: "For users with a strong life line — themes of resilience",
    ruleType: "palm",
    conditions: { dominantLine: "life" },
    template:
      "Your strong {{dominantLine}} line reflects a remarkable resilience and life force. " +
      "This is not about how long you live — it's about how fully you inhabit each moment. " +
      "Your guidance: engage your body intentionally this week. A walk in nature, movement you enjoy, or simply breathing deeply can reconnect you to this innate vitality.",
    isActive: true,
  },
  {
    name: "Strong Heart Line — Emotional Depth",
    description: "For users with a strong heart line — themes of emotional intelligence",
    ruleType: "palm",
    conditions: { dominantLine: "heart" },
    template:
      "Your prominent {{dominantLine}} line speaks of deep emotional capacity. " +
      "You feel things profoundly, and this is a strength. Your growth edge is learning to honor your emotional world without being overwhelmed by it. " +
      "Practice: this week, before reacting to strong emotions, pause and ask 'what does this feeling need?'",
    isActive: true,
  },
  {
    name: "Leader with Strong Fate — Purpose in Action",
    description: "Life path 1/8 combined with strong fate line",
    ruleType: "combined",
    conditions: { lifePathNumbers: [1, 8], dominantLine: "fate" },
    template:
      "The combination of your Life Path {{lifePathNumber}} and your strong {{dominantLine}} line is a signature of purposeful momentum. " +
      "You are someone who makes things happen — and you carry a responsibility to do so with awareness. " +
      "Focus this month: clarify your 'why.' The clearer your intention, the more aligned your actions become.",
    isActive: true,
  },
];
