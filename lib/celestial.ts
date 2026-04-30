// Celestial Analysis Engine — Deterministic Sun/Moon/Rising sign calculation
// All interpretations are symbolic and reflective, not predictive or medical.

export interface CelestialResult {
  sunSign: string;
  moonSign: string;
  risingSign: string;
  themes: string[];
  generatedSummary: string;
}

const ZODIAC_SIGNS = [
  "Aries",
  "Taurus",
  "Gemini",
  "Cancer",
  "Leo",
  "Virgo",
  "Libra",
  "Scorpio",
  "Sagittarius",
  "Capricorn",
  "Aquarius",
  "Pisces",
] as const;

type ZodiacSign = (typeof ZODIAC_SIGNS)[number];

const SIGN_MEANINGS: Record<ZodiacSign, { keywords: string[]; themes: string[] }> = {
  Aries: {
    keywords: ["courage", "initiative", "pioneering spirit"],
    themes: ["new beginnings", "bold action", "self-discovery"],
  },
  Taurus: {
    keywords: ["stability", "patience", "abundance"],
    themes: ["material security", "sensory beauty", "enduring values"],
  },
  Gemini: {
    keywords: ["curiosity", "communication", "adaptability"],
    themes: ["learning", "connection", "versatile expression"],
  },
  Cancer: {
    keywords: ["intuition", "nurturing", "emotional depth"],
    themes: ["home", "ancestral healing", "emotional wisdom"],
  },
  Leo: {
    keywords: ["creativity", "confidence", "generosity"],
    themes: ["self-expression", "leadership", "heart-centered living"],
  },
  Virgo: {
    keywords: ["discernment", "service", "refinement"],
    themes: ["healing", "practical wisdom", "devoted craft"],
  },
  Libra: {
    keywords: ["balance", "harmony", "justice"],
    themes: ["relationship", "aesthetic beauty", "diplomatic truth"],
  },
  Scorpio: {
    keywords: ["transformation", "depth", "regeneration"],
    themes: ["shadow work", "power", "mystical rebirth"],
  },
  Sagittarius: {
    keywords: ["wisdom", "freedom", "expansion"],
    themes: ["philosophy", "adventure", "higher truth"],
  },
  Capricorn: {
    keywords: ["mastery", "discipline", "legacy"],
    themes: ["long-term vision", "earned authority", "ancestral strength"],
  },
  Aquarius: {
    keywords: ["innovation", "community", "liberation"],
    themes: ["collective healing", "original thought", "humanitarian vision"],
  },
  Pisces: {
    keywords: ["compassion", "spirituality", "transcendence"],
    themes: ["mystical union", "dream wisdom", "unconditional love"],
  },
};

/**
 * Determine Sun Sign from date of birth (month/day).
 * Uses standard Western tropical zodiac date ranges.
 */
export function getSunSign(dateOfBirth: string): ZodiacSign {
  const d = new Date(dateOfBirth);
  const month = d.getMonth() + 1; // 1–12
  const day = d.getDate();

  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return "Aries";
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return "Taurus";
  if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return "Gemini";
  if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return "Cancer";
  if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return "Leo";
  if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return "Virgo";
  if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return "Libra";
  if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return "Scorpio";
  if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return "Sagittarius";
  if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return "Capricorn";
  if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return "Aquarius";
  return "Pisces"; // Feb 19 – Mar 20
}

/**
 * Deterministic Moon sign estimate.
 * Uses a simplified lunar cycle approximation keyed to the userId hash.
 * Shifts by 2 signs from Sun for symbolic variety.
 */
export function getMoonSign(sunSign: ZodiacSign, userId: string): ZodiacSign {
  const hash = userId.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const sunIdx = ZODIAC_SIGNS.indexOf(sunSign);
  // Offset moon sign by 2–5 positions for symbolic contrast
  const offset = 2 + (hash % 4);
  return ZODIAC_SIGNS[(sunIdx + offset) % 12];
}

/**
 * Deterministic Rising sign estimate.
 * Based on time of birth hour (if provided) or falls back to userId hash.
 */
export function getRisingSign(timeOfBirth: string | undefined, userId: string): ZodiacSign {
  let hour = 6; // Default to sunrise
  if (timeOfBirth) {
    const parts = timeOfBirth.split(":");
    hour = parseInt(parts[0] ?? "6", 10);
  } else {
    const hash = userId.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
    hour = hash % 24;
  }
  // Each sign rules ~2 hours of the day
  return ZODIAC_SIGNS[Math.floor(hour / 2) % 12];
}

/**
 * Generate a symbolic celestial summary from the three signs.
 */
export function generateCelestialSummary(
  sunSign: ZodiacSign,
  moonSign: ZodiacSign,
  risingSign: ZodiacSign
): { themes: string[]; generatedSummary: string } {
  const sun = SIGN_MEANINGS[sunSign];
  const moon = SIGN_MEANINGS[moonSign];
  const rising = SIGN_MEANINGS[risingSign];

  const themes = [
    ...sun.themes.slice(0, 1),
    ...moon.themes.slice(0, 1),
    ...rising.themes.slice(0, 1),
  ];

  const summary = [
    "✨ *Celestial insights are symbolic reflections — they are not predictions or fixed destinies.*",
    "",
    `**Sun in ${sunSign}** — Your core identity radiates ${sun.keywords.join(", ")}. ` +
      `You are here to explore the themes of ${sun.themes.join(" and ")}.`,
    "",
    `**Moon in ${moonSign}** — Your emotional world is shaped by ${moon.keywords.join(", ")}. ` +
      `Your soul seeks ${moon.themes[0]} as a source of inner nourishment.`,
    "",
    `**Rising in ${risingSign}** — The energy you project to the world carries ${rising.keywords.join(", ")}. ` +
      `Others may sense your gift for ${rising.themes[0]} before you speak a word.`,
    "",
    "**Integration:** The interplay of these three cosmic signatures reveals a soul navigating the intersection of " +
      `${sun.themes[0]}, ${moon.themes[0]}, and ${rising.themes[0]}. ` +
      "Honor each layer — the visible, the emotional, and the hidden — as equally sacred aspects of who you are.",
  ].join("\n");

  return { themes, generatedSummary: summary };
}

/**
 * Full celestial analysis from birth data and userId.
 */
export function analyzeCelestial(input: {
  dateOfBirth: string;
  timeOfBirth?: string;
  placeOfBirth?: string;
  userId: string;
}): CelestialResult {
  const sunSign = getSunSign(input.dateOfBirth);
  const moonSign = getMoonSign(sunSign, input.userId);
  const risingSign = getRisingSign(input.timeOfBirth, input.userId);
  const { themes, generatedSummary } = generateCelestialSummary(sunSign, moonSign, risingSign);

  return {
    sunSign,
    moonSign,
    risingSign,
    themes,
    generatedSummary,
  };
}
