// Palm Reading Engine (Left Hand)
// TODO: Replace mock implementation with real ML model endpoint
// Endpoint signature: POST /api/ml/palm-analyze { imageUrl: string } -> { lines: LineData[] }

export interface LineData {
  name: "life" | "heart" | "head" | "fate";
  strength: "weak" | "moderate" | "strong";
  characteristics: string[];
}

export interface PalmScanResult {
  extractedLines: LineData[];
  modelVersion: string;
  generatedSummary: string;
}

const LINE_MEANINGS: Record<string, Record<string, string>> = {
  life: {
    strong: "a resilient vitality and strong life force",
    moderate: "balanced energy that responds well to conscious self-care",
    weak: "a sensitivity to your environment — your wellbeing is deeply connected to your inner world",
  },
  heart: {
    strong: "a deep capacity for love, passion, and emotional connection",
    moderate: "a balanced heart that gives and receives with thoughtfulness",
    weak: "an evolving emotional landscape — you are learning to open more fully",
  },
  head: {
    strong: "a sharp, analytical mind with strong focus and intellectual drive",
    moderate: "a versatile mind that balances logic and intuition",
    weak: "an imaginative, intuitive mind that thinks in feelings and symbols",
  },
  fate: {
    strong: "a clear sense of direction and purposeful momentum",
    moderate: "a path that unfolds step by step through conscious choices",
    weak: "a highly self-directed journey — your path is shaped by inner freedom rather than fixed destiny",
  },
};

const FORK_MEANINGS: Record<string, string> = {
  life: "suggests adaptability and multiple pathways to vitality",
  heart: "reflects emotional complexity and the capacity for deep, multifaceted relationships",
  head: "indicates versatility of thought and the ability to blend logical and creative approaches",
  fate: "suggests that your life purpose may involve multiple roles or creative intersections",
};

/**
 * Deterministic mock palm analysis.
 * TODO: Replace with real ML model call:
 *   const response = await fetch(process.env.PALM_ML_ENDPOINT!, {
 *     method: "POST",
 *     body: JSON.stringify({ imageUrl }),
 *     headers: { "Content-Type": "application/json" }
 *   });
 *   const { lines } = await response.json();
 */
export async function analyzePalmImage(input: {
  imageUrl: string;
  userId: string;
}): Promise<PalmScanResult> {
  // Deterministic mock based on userId hash for consistent results
  const hash = input.userId
    .split("")
    .reduce((acc, c) => acc + c.charCodeAt(0), 0);

  const strengths: Array<"weak" | "moderate" | "strong"> = ["weak", "moderate", "strong"];
  const characteristicOptions: Record<string, string[][]> = {
    life: [
      ["curved gently", "extends to wrist"],
      ["clear arc", "moderate depth"],
      ["deep and long", "well-defined"],
    ],
    heart: [
      ["short", "rising toward index finger"],
      ["medium length", "slight curve"],
      ["long and curved", "prominent"],
    ],
    head: [
      ["slopes downward", "creative thinker"],
      ["straight", "balanced reasoning"],
      ["long and straight", "analytical focus"],
    ],
    fate: [
      ["faint", "self-made path"],
      ["broken sections", "evolving direction"],
      ["clear and straight", "purposeful trajectory"],
    ],
  };

  const lines: LineData[] = (["life", "heart", "head", "fate"] as const).map((name, i) => {
    const strengthIdx = (hash + i * 3) % 3;
    const strength = strengths[strengthIdx];
    const charIdx = strengthIdx;
    return {
      name,
      strength,
      characteristics: characteristicOptions[name][charIdx],
    };
  });

  // Simulate fork on head line if hash is even
  if (hash % 2 === 0) {
    const headLine = lines.find((l) => l.name === "head");
    if (headLine) {
      headLine.characteristics.push("forked at end");
    }
  }

  const summary = generatePalmSummary(lines);

  return {
    extractedLines: lines,
    modelVersion: "mock-v1.0",
    generatedSummary: summary,
  };
}

export function generatePalmSummary(lines: LineData[]): string {
  const parts: string[] = [
    "✋ *The following insights are symbolic and reflective — they are not medical advice or fixed predictions.*",
    "",
    "**Reading of Your Left Hand**",
    "",
  ];

  for (const line of lines) {
    const meaning = LINE_MEANINGS[line.name]?.[line.strength];
    const hasFork = line.characteristics.includes("forked at end");
    const forkNote = hasFork ? ` The fork in your ${line.name} line ${FORK_MEANINGS[line.name]}.` : "";

    const lineTitle = `${line.name.charAt(0).toUpperCase()}${line.name.slice(1)} Line`;
    parts.push(`**${lineTitle}** (${line.strength}):`);
    parts.push(`Your ${line.name} line reflects ${meaning}.${forkNote}`);
    parts.push("");
  }

  parts.push(
    "**Reflection prompt:** These patterns are not limits — they are invitations. " +
    "Consider journaling about one area that resonates, and one small action you can take this week to honor it."
  );

  return parts.join("\n");
}
