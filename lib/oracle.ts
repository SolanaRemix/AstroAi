// Oracle Engine — Past Life, Karma, and Guidance Insights

import type { NumerologyProfile, PalmScan, OracleRule } from "@prisma/client";
import { NUMBER_MEANINGS } from "./numerology";
import type { LineData } from "./palm";

export interface OracleInsightResult {
  theme: "past_life" | "karma" | "guidance" | "goal_path";
  title: string;
  body: string;
}

/**
 * Interpolate template placeholders with actual values.
 * Supported: {{lifePathNumber}}, {{dominantLine}}, {{themeKeywords}}, {{name}}
 */
function interpolate(template: string, vars: Record<string, string>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key: string) => vars[key] ?? `[${key}]`);
}

/**
 * Check if a rule's conditions match the given profile/scan data.
 */
function ruleMatches(
  rule: OracleRule,
  numerology?: NumerologyProfile | null,
  palm?: PalmScan | null
): boolean {
  const conditions = rule.conditions as Record<string, unknown>;

  if (rule.ruleType === "numerology" && numerology) {
    const lifePaths = conditions.lifePathNumbers as number[] | undefined;
    if (lifePaths && !lifePaths.includes(numerology.lifePathNumber)) return false;
    return true;
  }

  if (rule.ruleType === "palm" && palm) {
    const lines = (palm.extractedLines ?? []) as unknown as LineData[];
    const requiredLine = conditions.dominantLine as string | undefined;
    if (requiredLine) {
      const found = lines.find(
        (l: LineData) => l.name === requiredLine && (l.strength === "strong" || l.strength === "moderate")
      );
      if (!found) return false;
    }
    return true;
  }

  if (rule.ruleType === "combined" && numerology && palm) {
    const lifePaths = conditions.lifePathNumbers as number[] | undefined;
    if (lifePaths && !lifePaths.includes(numerology.lifePathNumber)) return false;
    const lines = (palm.extractedLines ?? []) as unknown as LineData[];
    const requiredLine = conditions.dominantLine as string | undefined;
    if (requiredLine) {
      const found = lines.find(
        (l: LineData) => l.name === requiredLine && l.strength === "strong"
      );
      if (!found) return false;
    }
    return true;
  }

  return false;
}

/**
 * Build template variables from available profile/scan data.
 */
function buildVars(
  numerology?: NumerologyProfile | null,
  palm?: PalmScan | null
): Record<string, string> {
  const vars: Record<string, string> = {};

  if (numerology) {
    vars.lifePathNumber = String(numerology.lifePathNumber);
    const meanings = NUMBER_MEANINGS[numerology.lifePathNumber];
    vars.themeKeywords = meanings?.keywords.join(", ") ?? "";
    vars.strengths = meanings?.strengths.join(", ") ?? "";
    vars.growthThemes = meanings?.growthThemes.join(", ") ?? "";
  }

  if (palm) {
    const lines = (palm.extractedLines ?? []) as unknown as LineData[];
    const strongLine = lines
      .filter((l: LineData) => l.strength === "strong")
      .map((l: LineData) => l.name)[0];
    vars.dominantLine = strongLine ?? "life";
    vars.palmSummarySnippet =
      lines
        .filter((l: LineData) => l.strength === "strong")
        .map((l: LineData) => `${l.name} line`)
        .join(" and ") || "balanced lines";
  }

  return vars;
}

/** Fallback insights when no matching rules are found */
function defaultInsights(
  numerology?: NumerologyProfile | null,
  _palm?: PalmScan | null
): OracleInsightResult[] {
  const lpNum = numerology?.lifePathNumber ?? 1;
  const meanings = NUMBER_MEANINGS[lpNum];

  return [
    {
      theme: "past_life",
      title: "Echoes Across Time",
      body:
        `Your soul carries the symbolic echoes of ${meanings?.keywords[0] ?? "growth"} and ` +
        `${meanings?.keywords[1] ?? "transformation"}. These themes are not burdens from the past — ` +
        `they are gifts waiting to be understood. Reflect on where in your life you feel a deep, ` +
        `unexplained familiarity with certain roles or relationships.`,
    },
    {
      theme: "karma",
      title: "Current Karmic Thread",
      body:
        `The primary karmic invitation in this life is to master ${meanings?.growthThemes[0]?.toLowerCase() ?? "balance"}. ` +
        `This shows up where you feel the most resistance — and also where you find the deepest reward. ` +
        `Notice patterns in your relationships and choices this week.`,
    },
    {
      theme: "guidance",
      title: "Your Path Forward",
      body:
        `Your core strengths — ${meanings?.strengths.slice(0, 2).join(" and ") ?? "resilience and wisdom"} — ` +
        `are your greatest tools. Focus on small, daily actions that align with your values. ` +
        `Journaling, intentional conversation, and creative expression are powerful allies for you right now.`,
    },
    {
      theme: "goal_path",
      title: "What to Focus On",
      body:
        `To move toward what you truly want, redirect your energy toward ${meanings?.growthThemes.join(", ") ?? "growth and clarity"}. ` +
        `Set one clear intention this week. Celebrate progress, not perfection. Your path is uniquely yours.`,
    },
  ];
}

/**
 * Generate oracle insights from matching rules + fallback defaults.
 */
export function generateOracleInsights(input: {
  numerologyProfile?: NumerologyProfile | null;
  palmScan?: PalmScan | null;
  rules: OracleRule[];
}): OracleInsightResult[] {
  const { numerologyProfile, palmScan, rules } = input;
  const vars = buildVars(numerologyProfile, palmScan);

  const matchingRules = rules.filter(
    (r) => r.isActive && ruleMatches(r, numerologyProfile, palmScan)
  );

  if (matchingRules.length === 0) {
    return defaultInsights(numerologyProfile, palmScan);
  }

  const insights: OracleInsightResult[] = matchingRules.map((rule) => {
    const body = interpolate(rule.template, vars);
    const theme = (
      rule.ruleType === "numerology" ? "karma" :
      rule.ruleType === "palm" ? "guidance" :
      "goal_path"
    ) as OracleInsightResult["theme"];

    return {
      theme,
      title: rule.name,
      body,
    };
  });

  // Always include a past-life reflection
  insights.unshift({
    theme: "past_life",
    title: "Echoes Across Time",
    body:
      `Through the lens of symbolic reflection, your patterns suggest a soul well-acquainted with ` +
      `${vars.themeKeywords ?? "growth and change"}. These are not predictions — they are mirrors for your ` +
      `own wisdom. What recurring themes do you notice in your closest relationships?`,
  });

  return insights;
}
