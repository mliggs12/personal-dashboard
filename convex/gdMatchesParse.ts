"use node";

import { v } from "convex/values";

import { api, internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";
import { action } from "./_generated/server";

/**
 * Parse Galaxy Defense end-game screenshots stored in Convex file
 * storage, create/merge a match record, and upsert the turret catalog.
 *
 * The authenticated user is resolved via `api.users.current`. We pass
 * `userId` explicitly to internal mutations so ownership is enforced
 * even though actions don't carry identity through to internal code.
 */

const PARSE_PROMPT = `You are parsing the end-game summary screen from the mobile game Galaxy Defense.

Extract every visible field into STRICT JSON. Do not invent turrets
that aren't shown. If a value is not visible, use null.

Schema (all keys required; set to null when unknown):

{
  "result": "victory" | "defeat",
  "stage_number": integer,
  "stage_difficulty": "normal" | "elite" | null,
  "remaining_hp_pct": integer 0-100 or null,
  "duration_seconds": integer (parsed from mm:ss in the top bar) or null,
  "coins": integer or null,
  "reward_cubes": integer or null,
  "turrets": [
    {
      "slot": 0-based integer position (top row is 0),
      "turret_key": short lowercase_snake_case identifier, stable across
        screenshots for the same turret (e.g. "green_laser", "sniper",
        "rocket"). Base it on obvious visual cues (color + weapon type).
      "turret_display_name": pretty name if identifiable, else null,
      "level": integer shown in the round chip (often 1), or null,
      "gems_filled": number of filled diamond gems (cyan/teal),
      "gems_total": total diamond slots shown (including the purple one),
      "has_epic_gem": true if the rightmost purple diamond is filled,
      "damage_display": the exact DMG string as shown (e.g. "35.6k"),
      "damage": same value parsed to integer (35.6k -> 35600),
      "dps_display": the exact DPS string as shown,
      "dps": same value parsed to integer
    }
  ],
  "confidence": float 0.0-1.0,
  "notes": short free-text about anything ambiguous, or null
}

Numeric suffix rules: k = 1_000, M = 1_000_000, B = 1_000_000_000.
Round to nearest integer. "35.21k" -> 35210.

If the turret list is scrolled (cut off top or bottom), return only
the turrets fully visible. Mention it in notes.

Return ONLY the JSON object. No prose. No code fences.`;

interface ParsedTurretJson {
  slot: number;
  turret_key: string;
  turret_display_name: string | null;
  level: number | null;
  gems_filled: number | null;
  gems_total: number | null;
  has_epic_gem: boolean | null;
  damage_display: string | null;
  damage: number | null;
  dps_display: string | null;
  dps: number | null;
}

interface ParsedJson {
  result: "victory" | "defeat";
  stage_number: number;
  stage_difficulty: "normal" | "elite" | null;
  remaining_hp_pct: number | null;
  duration_seconds: number | null;
  coins: number | null;
  reward_cubes: number | null;
  turrets: ParsedTurretJson[];
  confidence: number | null;
  notes: string | null;
}

const SUFFIX: Record<string, number> = {
  k: 1_000,
  K: 1_000,
  m: 1_000_000,
  M: 1_000_000,
  b: 1_000_000_000,
  B: 1_000_000_000,
};

function parseNumeric(display: string | null | undefined): number {
  if (!display) return 0;
  const s = String(display).trim().replace(/,/g, "");
  const m = s.match(/^(-?\d+(?:\.\d+)?)([kKmMbB]?)$/);
  if (!m) {
    const digits = s.replace(/[^\d.]/g, "");
    const n = Number.parseFloat(digits);
    return Number.isFinite(n) ? Math.round(n) : 0;
  }
  return Math.round(Number.parseFloat(m[1]) * (SUFFIX[m[2]] ?? 1));
}

function extractJson(text: string): ParsedJson {
  let t = text.trim();
  t = t.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "");
  const start = t.indexOf("{");
  const end = t.lastIndexOf("}");
  if (start === -1 || end === -1) {
    throw new Error(`No JSON object in model output: ${text.slice(0, 200)}`);
  }
  return JSON.parse(t.slice(start, end + 1)) as ParsedJson;
}

async function callAnthropic(
  imageBase64: string,
  mime: string,
  apiKey: string,
  model: string,
): Promise<string> {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model,
      max_tokens: 2048,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: mime,
                data: imageBase64,
              },
            },
            { type: "text", text: PARSE_PROMPT },
          ],
        },
      ],
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Anthropic error ${res.status}: ${text}`);
  }
  const data = (await res.json()) as {
    content: Array<{ type: string; text?: string }>;
  };
  return data.content
    .filter((b) => b.type === "text")
    .map((b) => b.text ?? "")
    .join("");
}

function arrayBufferToBase64(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  let binary = "";
  const CHUNK = 0x8000;
  for (let i = 0; i < bytes.length; i += CHUNK) {
    binary += String.fromCharCode(...bytes.subarray(i, i + CHUNK));
  }
  return Buffer.from(binary, "binary").toString("base64");
}

/**
 * Parse one or more screenshots as a single "submission" — the
 * screenshots are assumed to belong to the same match when they share
 * result + stage number and were taken close together.
 */
export const parseScreenshots = action({
  args: {
    screenshotStorageIds: v.array(v.id("_storage")),
    playedAt: v.optional(v.number()), // defaults to now
    notes: v.optional(v.string()),
  },
  handler: async (
    ctx,
    { screenshotStorageIds, playedAt, notes },
  ): Promise<{ matchId: Id<"gdMatches">; merged: boolean }> => {
    if (screenshotStorageIds.length === 0) {
      throw new Error("No screenshots provided");
    }

    const user = await ctx.runQuery(api.users.current, {});
    if (!user) throw new Error("Not authenticated");

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error(
        "ANTHROPIC_API_KEY is not set. Add it via `npx convex env set ANTHROPIC_API_KEY ...`",
      );
    }
    const model =
      process.env.ANTHROPIC_MODEL ?? "claude-sonnet-4-5-20250929";
    const windowMs = Number.parseInt(
      process.env.GD_MATCH_WINDOW_MS ?? "180000",
      10,
    );

    const submittedAt = playedAt ?? Date.now();
    let matchId: Id<"gdMatches"> | null = null;
    let merged = false;
    const aggregatedTurretKeys = new Set<string>();
    const turretDisplayByKey = new Map<string, string | undefined>();

    for (let i = 0; i < screenshotStorageIds.length; i++) {
      const storageId = screenshotStorageIds[i];
      const blob = await ctx.storage.get(storageId);
      if (!blob) throw new Error(`Screenshot ${storageId} not found`);
      const mime = blob.type || "image/jpeg";
      const buf = await blob.arrayBuffer();
      const base64 = arrayBufferToBase64(buf);

      const raw = await callAnthropic(base64, mime, apiKey, model);
      const parsed = extractJson(raw);

      const turrets = (parsed.turrets ?? []).map((t, idx) => {
        const damageDisplay = t.damage_display ?? "";
        const dpsDisplay = t.dps_display ?? "";
        const damage =
          typeof t.damage === "number" && Number.isFinite(t.damage)
            ? Math.round(t.damage)
            : parseNumeric(damageDisplay);
        const dps =
          typeof t.dps === "number" && Number.isFinite(t.dps)
            ? Math.round(t.dps)
            : parseNumeric(dpsDisplay);
        return {
          slot: Number.isFinite(t.slot) ? Math.round(t.slot) : idx,
          turretKey: t.turret_key || `turret_row_${idx}`,
          turretDisplayName: t.turret_display_name ?? undefined,
          level: t.level ?? undefined,
          gemsFilled: t.gems_filled ?? undefined,
          gemsTotal: t.gems_total ?? undefined,
          hasEpicGem: t.has_epic_gem ?? undefined,
          damage,
          damageDisplay,
          dps,
          dpsDisplay,
        };
      });

      for (const t of turrets) {
        if (t.turretDisplayName) {
          turretDisplayByKey.set(t.turretKey, t.turretDisplayName);
        }
      }

      if (matchId === null) {
        // First image: try to merge into a recent match, else create.
        const existingId = await ctx.runQuery(
          internal.gdMatches.findRecentMatchInternal,
          {
            userId: user._id,
            stageNumber: parsed.stage_number,
            result: parsed.result,
            playedAt: submittedAt,
            windowMs,
          },
        );

        if (existingId) {
          matchId = existingId;
          merged = true;
          const inserted = await ctx.runMutation(
            internal.gdMatches.appendTurretsInternal,
            {
              matchId: existingId,
              userId: user._id,
              screenshotStorageId: storageId,
              turrets,
            },
          );
          inserted.forEach((k) => aggregatedTurretKeys.add(k));
        } else {
          matchId = await ctx.runMutation(
            internal.gdMatches.createMatchInternal,
            {
              userId: user._id,
              result: parsed.result,
              stageNumber: parsed.stage_number,
              stageDifficulty: parsed.stage_difficulty ?? undefined,
              remainingHpPct: parsed.remaining_hp_pct ?? undefined,
              durationSeconds: parsed.duration_seconds ?? undefined,
              coins: parsed.coins ?? undefined,
              rewardCubes: parsed.reward_cubes ?? undefined,
              playedAt: submittedAt,
              notes: notes ?? parsed.notes ?? undefined,
              screenshotStorageIds: [storageId],
              modelUsed: `anthropic:${model}`,
              confidence: parsed.confidence ?? undefined,
              turrets,
            },
          );
          turrets.forEach((t) => aggregatedTurretKeys.add(t.turretKey));
        }
      } else {
        // Subsequent images of the same submission → always append.
        const inserted = await ctx.runMutation(
          internal.gdMatches.appendTurretsInternal,
          {
            matchId,
            userId: user._id,
            screenshotStorageId: storageId,
            turrets,
          },
        );
        inserted.forEach((k) => aggregatedTurretKeys.add(k));
      }
    }

    // Upsert turret catalog so the leaderboard has nice display names.
    for (const key of aggregatedTurretKeys) {
      await ctx.runMutation(internal.gdTurrets.upsertInternal, {
        userId: user._id,
        key,
        displayName: turretDisplayByKey.get(key),
        increment: 1,
      });
    }

    if (matchId === null) throw new Error("No match created");
    return { matchId, merged };
  },
});
