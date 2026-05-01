import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import type { LineData } from "@/lib/palm";
import { generatePalmSummary } from "@/lib/palm";

/**
 * Realtime palm scan endpoint for MediaPipe Hands / TensorFlow.js HandPose.
 *
 * Accepts 21 hand landmark points extracted by the client-side ML model,
 * computes line segment mappings from landmark positions, and returns
 * symbolic line interpretations without persisting to the database.
 *
 * Input landmarks use the standard MediaPipe Hands 21-point indexing.
 * The specific landmark groupings used for life, heart, head, and fate
 * lines are defined by `extractLines()` below and should be treated as
 * the authoritative server-side mapping.
 */

interface Landmark {
  x: number;
  y: number;
  z: number;
}

interface RealtimeRequest {
  landmarks: Landmark[];
  hand: "Left" | "Right";
}

function distance(a: Landmark, b: Landmark): number {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2 + (a.z - b.z) ** 2);
}

function avgDepth(points: Landmark[]): number {
  if (points.length === 0) return 0;
  return points.reduce((sum, p) => sum + p.z, 0) / points.length;
}

function classifyStrength(value: number, low: number, high: number): "weak" | "moderate" | "strong" {
  if (value >= high) return "strong";
  if (value >= low) return "moderate";
  return "weak";
}

function extractLines(landmarks: Landmark[]): LineData[] {
  // Life line: arc from wrist (0) through palm (1,5,9,13,17)
  const lifePoints = [landmarks[0], landmarks[1], landmarks[5], landmarks[9]].filter(Boolean);
  const lifeLength = lifePoints.reduce((sum, p, i) =>
    i === 0 ? 0 : sum + distance(lifePoints[i - 1], p), 0
  );
  const lifeDepth = Math.abs(avgDepth(lifePoints));

  // Heart line: horizontal upper palm (5–17 axis)
  const heartPoints = [landmarks[5], landmarks[9], landmarks[13], landmarks[17]].filter(Boolean);
  const heartLength = heartPoints.reduce((sum, p, i) =>
    i === 0 ? 0 : sum + distance(heartPoints[i - 1], p), 0
  );
  const heartDepth = Math.abs(avgDepth(heartPoints));

  // Head line: thumb–index axis (1,2,3,4,5)
  const headPoints = [landmarks[1], landmarks[2], landmarks[5], landmarks[9]].filter(Boolean);
  const headLength = headPoints.reduce((sum, p, i) =>
    i === 0 ? 0 : sum + distance(headPoints[i - 1], p), 0
  );
  const headDepth = Math.abs(avgDepth(headPoints));

  // Fate line: wrist to middle finger base (0,9)
  const fateStart = landmarks[0];
  const fateEnd = landmarks[9];
  const fateLength = fateStart && fateEnd ? distance(fateStart, fateEnd) : 0;
  const fateDepth = fateStart && fateEnd ? Math.abs(avgDepth([fateStart, fateEnd])) : 0;

  return [
    {
      name: "life",
      strength: classifyStrength(lifeLength + lifeDepth * 2, 0.3, 0.6),
      characteristics: [
        `length ${lifeLength.toFixed(3)}`,
        `depth ${lifeDepth.toFixed(3)}`,
        lifeLength > 0.5 ? "extends to wrist" : "shorter arc",
      ],
    },
    {
      name: "heart",
      strength: classifyStrength(heartLength + heartDepth * 2, 0.25, 0.5),
      characteristics: [
        `length ${heartLength.toFixed(3)}`,
        `depth ${heartDepth.toFixed(3)}`,
        heartLength > 0.4 ? "long and curved" : "moderate length",
      ],
    },
    {
      name: "head",
      strength: classifyStrength(headLength + headDepth * 2, 0.2, 0.45),
      characteristics: [
        `length ${headLength.toFixed(3)}`,
        `depth ${headDepth.toFixed(3)}`,
        headLength > 0.35 ? "straight analytical line" : "slopes toward intuition",
      ],
    },
    {
      name: "fate",
      strength: classifyStrength(fateLength + fateDepth * 2, 0.2, 0.4),
      characteristics: [
        `length ${fateLength.toFixed(3)}`,
        `depth ${fateDepth.toFixed(3)}`,
        fateLength > 0.3 ? "clear trajectory" : "self-directed path",
      ],
    },
  ];
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json() as RealtimeRequest;
  const { landmarks, hand } = body;

  if (!landmarks || !Array.isArray(landmarks) || landmarks.length < 21) {
    return NextResponse.json(
      { error: "landmarks must be an array of at least 21 points" },
      { status: 400 }
    );
  }

  // Validate that every landmark has finite numeric x, y, z
  const invalidIdx = landmarks.findIndex(
    (lm) =>
      typeof lm !== "object" ||
      lm === null ||
      !isFinite(lm.x) ||
      !isFinite(lm.y) ||
      !isFinite(lm.z)
  );
  if (invalidIdx !== -1) {
    return NextResponse.json(
      { error: `Landmark at index ${invalidIdx} has invalid or non-finite x/y/z values` },
      { status: 400 }
    );
  }

  if (hand !== "Left") {
    return NextResponse.json(
      { error: "Only left-hand analysis is supported" },
      { status: 400 }
    );
  }

  const lines = extractLines(landmarks);
  const summary = generatePalmSummary(lines);

  return NextResponse.json({
    lines,
    summary,
    modelVersion: "realtime-landmark-v1.0",
  });
}
