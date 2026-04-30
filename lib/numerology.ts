// Pythagorean Numerology Engine

const PYTHAGOREAN_MAP: Record<string, number> = {
  A: 1, B: 2, C: 3, D: 4, E: 5, F: 6, G: 7, H: 8, I: 9,
  J: 1, K: 2, L: 3, M: 4, N: 5, O: 6, P: 7, Q: 8, R: 9,
  S: 1, T: 2, U: 3, V: 4, W: 5, X: 6, Y: 7, Z: 8,
};

const VOWELS = new Set(["A", "E", "I", "O", "U"]);

function reduceToSingleDigit(n: number): number {
  // Master numbers: 11, 22, 33
  if (n === 11 || n === 22 || n === 33) return n;
  if (n <= 9) return n;
  const sum = String(n)
    .split("")
    .reduce((acc, d) => acc + parseInt(d), 0);
  return reduceToSingleDigit(sum);
}

/** Life Path Number: sum of all digits of birthdate, reduced */
export function calculateLifePath(birthDate: Date): number {
  const year = birthDate.getFullYear();
  const month = birthDate.getMonth() + 1;
  const day = birthDate.getDate();

  const yearSum = String(year)
    .split("")
    .reduce((acc, d) => acc + parseInt(d), 0);
  const monthSum = String(month)
    .split("")
    .reduce((acc, d) => acc + parseInt(d), 0);
  const daySum = String(day)
    .split("")
    .reduce((acc, d) => acc + parseInt(d), 0);

  return reduceToSingleDigit(yearSum + monthSum + daySum);
}

/** Destiny Number: sum of all letter values in full name */
export function calculateDestiny(fullName: string): number {
  const total = fullName
    .toUpperCase()
    .split("")
    .filter((c) => /[A-Z]/.test(c))
    .reduce((acc, c) => acc + (PYTHAGOREAN_MAP[c] ?? 0), 0);
  return reduceToSingleDigit(total);
}

/** Soul Urge Number: sum of vowel values */
export function calculateSoulUrge(fullName: string): number {
  const total = fullName
    .toUpperCase()
    .split("")
    .filter((c) => VOWELS.has(c))
    .reduce((acc, c) => acc + (PYTHAGOREAN_MAP[c] ?? 0), 0);
  return reduceToSingleDigit(total);
}

/** Personality Number: sum of consonant values */
export function calculatePersonality(fullName: string): number {
  const total = fullName
    .toUpperCase()
    .split("")
    .filter((c) => /[A-Z]/.test(c) && !VOWELS.has(c))
    .reduce((acc, c) => acc + (PYTHAGOREAN_MAP[c] ?? 0), 0);
  return reduceToSingleDigit(total);
}

export interface NumberMeaning {
  keywords: string[];
  strengths: string[];
  challenges: string[];
  growthThemes: string[];
}

export const NUMBER_MEANINGS: Record<number, NumberMeaning> = {
  1: {
    keywords: ["leadership", "independence", "originality"],
    strengths: ["Pioneering spirit", "Confidence", "Determination"],
    challenges: ["Stubbornness", "Ego", "Isolation"],
    growthThemes: ["Collaboration", "Humility", "Patience"],
  },
  2: {
    keywords: ["cooperation", "diplomacy", "harmony"],
    strengths: ["Empathy", "Peacemaking", "Sensitivity"],
    challenges: ["Indecision", "Over-reliance", "Emotional volatility"],
    growthThemes: ["Boundaries", "Self-trust", "Decisiveness"],
  },
  3: {
    keywords: ["creativity", "expression", "joy"],
    strengths: ["Artistry", "Communication", "Optimism"],
    challenges: ["Scattered focus", "Superficiality", "Moodiness"],
    growthThemes: ["Discipline", "Depth", "Follow-through"],
  },
  4: {
    keywords: ["stability", "structure", "hard work"],
    strengths: ["Reliability", "Practicality", "Perseverance"],
    challenges: ["Rigidity", "Resistance to change", "Overwork"],
    growthThemes: ["Flexibility", "Rest", "Play"],
  },
  5: {
    keywords: ["freedom", "change", "adventure"],
    strengths: ["Adaptability", "Curiosity", "Resourcefulness"],
    challenges: ["Restlessness", "Irresponsibility", "Overindulgence"],
    growthThemes: ["Commitment", "Grounding", "Focus"],
  },
  6: {
    keywords: ["nurturing", "responsibility", "balance"],
    strengths: ["Compassion", "Generosity", "Idealism"],
    challenges: ["Over-giving", "Perfectionism", "Martyrdom"],
    growthThemes: ["Self-care", "Healthy limits", "Receiving"],
  },
  7: {
    keywords: ["wisdom", "analysis", "spirituality"],
    strengths: ["Intellect", "Intuition", "Inner knowing"],
    challenges: ["Isolation", "Cynicism", "Overthinking"],
    growthThemes: ["Trust", "Connection", "Openness"],
  },
  8: {
    keywords: ["power", "abundance", "manifestation"],
    strengths: ["Ambition", "Authority", "Efficiency"],
    challenges: ["Control", "Materialism", "Ruthlessness"],
    growthThemes: ["Service", "Balance", "Generosity"],
  },
  9: {
    keywords: ["completion", "compassion", "universal love"],
    strengths: ["Wisdom", "Humanitarianism", "Creativity"],
    challenges: ["Letting go", "Bitterness", "Aloofness"],
    growthThemes: ["Release", "Forgiveness", "Purpose"],
  },
  11: {
    keywords: ["intuition", "inspiration", "illumination"],
    strengths: ["Visionary insight", "Spiritual sensitivity", "Charisma"],
    challenges: ["Anxiety", "Impracticality", "Overwhelm"],
    growthThemes: ["Grounding spiritual gifts", "Practical application", "Balance"],
  },
  22: {
    keywords: ["master builder", "vision", "large-scale creation"],
    strengths: ["Leadership", "Practicality", "Transformative power"],
    challenges: ["Pressure", "Self-doubt", "Perfectionism"],
    growthThemes: ["Delegation", "Self-compassion", "Trust in the process"],
  },
  33: {
    keywords: ["master teacher", "healing", "upliftment"],
    strengths: ["Compassion", "Nurturing", "Creative expression"],
    challenges: ["Self-sacrifice", "Emotional burden", "Idealism"],
    growthThemes: ["Boundaries", "Personal needs", "Practical healing"],
  },
};

export interface NumerologyProfileInput {
  lifePathNumber: number;
  destinyNumber: number;
  soulUrgeNumber: number;
  personalityNumber: number;
}

export function generateNumerologySummary(profile: NumerologyProfileInput): string {
  const lp = NUMBER_MEANINGS[profile.lifePathNumber];
  const dest = NUMBER_MEANINGS[profile.destinyNumber];
  const soul = NUMBER_MEANINGS[profile.soulUrgeNumber];
  const pers = NUMBER_MEANINGS[profile.personalityNumber];

  return `Your Life Path ${profile.lifePathNumber} calls you toward ${lp?.keywords.join(", ")}. ` +
    `Your core strengths include ${lp?.strengths.slice(0, 2).join(" and ")}, while your growth edge invites you to explore ${lp?.growthThemes[0]?.toLowerCase()}.

Your Destiny Number ${profile.destinyNumber} reveals a calling rooted in ${dest?.keywords.join(", ")}, ` +
    `expressing itself through ${dest?.strengths[0]?.toLowerCase()}.

Your Soul Urge Number ${profile.soulUrgeNumber} reflects a deep inner desire for ${soul?.keywords.join(", ")}. ` +
    `Honoring this means embracing ${soul?.growthThemes[0]?.toLowerCase()}.

Your Personality Number ${profile.personalityNumber} shows the world your ${pers?.keywords.join(", ")} energy — ` +
    `you project ${pers?.strengths[0]?.toLowerCase()} and are learning to balance ${pers?.challenges[0]?.toLowerCase()}.

This is an invitation, not a fixed path. You hold the power to choose how these energies express through you.`;
}
