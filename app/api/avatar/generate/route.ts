import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { NUMBER_MEANINGS } from "@/lib/numerology";

/**
 * Avatar generation endpoint.
 * Returns a deterministic avatar concept description based on the user's
 * numerology and palm data. To integrate a real image generation model
 * (e.g. Gemini Imagen, DALL-E, Stable Diffusion), replace the
 * `generateAvatarPrompt` logic with an API call to your chosen provider.
 *
 * TODO: Set AVATAR_GENERATION_ENDPOINT in env to enable real AI avatar generation.
 */
export async function POST() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await db.user.findUnique({
    where: { email: session.user.email },
    include: {
      numerologyProfile: true,
      palmScans: { orderBy: { createdAt: "desc" }, take: 1 },
      celestialInsights: { orderBy: { createdAt: "desc" }, take: 1 },
    },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const profile = user.numerologyProfile;
  const celestial = user.celestialInsights[0] ?? null;

  const lifePathNum = profile?.lifePathNumber ?? 1;
  const meanings = NUMBER_MEANINGS[lifePathNum];
  const sunSign = celestial?.sunSign ?? "Aries";

  // Build symbolic avatar prompt
  const prompt = [
    `A mystical avatar portrait imbued with the energy of Life Path ${lifePathNum}.`,
    `The figure radiates ${meanings?.keywords.join(", ")} with a ${sunSign} celestial influence.`,
    profile
      ? `Core strengths: ${meanings?.strengths.slice(0, 2).join(" and ")}.`
      : "",
    celestial
      ? `Celestial themes: ${(celestial.themes as string[] | null)?.join(", ") ?? "cosmic wisdom"}.`
      : "",
    "Style: ethereal, symbolic, empowering. Non-realistic, art nouveau cosmic illustration.",
  ]
    .filter(Boolean)
    .join(" ");

  // If a real generation endpoint is configured, call it
  const endpoint = process.env.AVATAR_GENERATION_ENDPOINT;
  if (endpoint) {
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      if (res.ok) {
        const data = await res.json() as { imageUrl?: string };
        return NextResponse.json({ prompt, imageUrl: data.imageUrl ?? null });
      }
    } catch {
      // Fall through to prompt-only response
    }
  }

  return NextResponse.json({
    prompt,
    imageUrl: null,
    note: "Configure AVATAR_GENERATION_ENDPOINT to enable AI image generation.",
  });
}
