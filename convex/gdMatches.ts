import { v } from "convex/values";

import { Doc, Id } from "./_generated/dataModel";
import {
  internalMutation,
  internalQuery,
  mutation,
  query,
  QueryCtx,
} from "./_generated/server";
import { getCurrentUserOrThrow } from "./users";

/**
 * Galaxy Defense match tracking — CRUD + aggregated reads.
 *
 * The parse action (`gdMatchesParse.parseScreenshots`) inserts data
 * here via the `createMatchInternal` / `appendTurretsInternal` entry
 * points. User-facing mutations stay authenticated via Clerk.
 */

const turretValidator = v.object({
  slot: v.number(),
  turretKey: v.string(),
  turretDisplayName: v.optional(v.string()),
  level: v.optional(v.number()),
  gemsFilled: v.optional(v.number()),
  gemsTotal: v.optional(v.number()),
  hasEpicGem: v.optional(v.boolean()),
  damage: v.number(),
  damageDisplay: v.string(),
  dps: v.number(),
  dpsDisplay: v.string(),
});

async function hydrateMatches(ctx: QueryCtx, matches: Doc<"gdMatches">[]) {
  return Promise.all(
    matches.map(async (match) => {
      const turrets = await ctx.db
        .query("gdMatchTurrets")
        .withIndex("by_match", (q) => q.eq("matchId", match._id))
        .collect();
      return {
        ...match,
        turrets: turrets.sort((a, b) => a.slot - b.slot),
      };
    }),
  );
}

export const list = query({
  args: {
    limit: v.optional(v.number()),
    stageNumber: v.optional(v.number()),
  },
  async handler(ctx, { limit, stageNumber }) {
    const user = await getCurrentUserOrThrow(ctx);
    const base = ctx.db
      .query("gdMatches")
      .withIndex("by_user_playedAt", (q) => q.eq("userId", user._id))
      .order("desc");
    const raw = await base.take(limit ?? 200);
    const filtered =
      stageNumber === undefined
        ? raw
        : raw.filter((m) => m.stageNumber === stageNumber);
    return hydrateMatches(ctx, filtered);
  },
});

export const get = query({
  args: { matchId: v.id("gdMatches") },
  async handler(ctx, { matchId }) {
    const user = await getCurrentUserOrThrow(ctx);
    const match = await ctx.db.get(matchId);
    if (!match || match.userId !== user._id) return null;
    const [hydrated] = await hydrateMatches(ctx, [match]);
    return hydrated;
  },
});

export const remove = mutation({
  args: { matchId: v.id("gdMatches") },
  async handler(ctx, { matchId }) {
    const user = await getCurrentUserOrThrow(ctx);
    const match = await ctx.db.get(matchId);
    if (!match || match.userId !== user._id) {
      throw new Error("Match not found");
    }
    const turrets = await ctx.db
      .query("gdMatchTurrets")
      .withIndex("by_match", (q) => q.eq("matchId", matchId))
      .collect();
    for (const t of turrets) await ctx.db.delete(t._id);
    await ctx.db.delete(matchId);
  },
});

export const updateNotes = mutation({
  args: {
    matchId: v.id("gdMatches"),
    notes: v.string(),
  },
  async handler(ctx, { matchId, notes }) {
    const user = await getCurrentUserOrThrow(ctx);
    const match = await ctx.db.get(matchId);
    if (!match || match.userId !== user._id) {
      throw new Error("Match not found");
    }
    await ctx.db.patch(matchId, { notes, updated: Date.now() });
  },
});

/* ---------- internal mutations used by the parse action ---------- */

async function resolveStageId(
  ctx: QueryCtx,
  userId: Id<"users">,
  stageNumber: number,
  difficulty?: "normal" | "elite",
): Promise<Id<"gdStages"> | undefined> {
  const candidates = await ctx.db
    .query("gdStages")
    .withIndex("by_user_number", (q) =>
      q.eq("userId", userId).eq("number", stageNumber),
    )
    .collect();
  if (candidates.length === 0) return undefined;
  if (difficulty) {
    return candidates.find((s) => s.difficulty === difficulty)?._id;
  }
  return candidates[0]._id;
}

export const findRecentMatchInternal = internalQuery({
  args: {
    userId: v.id("users"),
    stageNumber: v.number(),
    result: v.union(v.literal("victory"), v.literal("defeat")),
    playedAt: v.number(),
    windowMs: v.number(),
  },
  async handler(
    ctx,
    { userId, stageNumber, result, playedAt, windowMs },
  ) {
    const candidates = await ctx.db
      .query("gdMatches")
      .withIndex("by_user_stage", (q) =>
        q.eq("userId", userId).eq("stageNumber", stageNumber),
      )
      .collect();
    const match = candidates.find(
      (m) =>
        m.result === result &&
        Math.abs(m.playedAt - playedAt) <= windowMs,
    );
    return match?._id ?? null;
  },
});

export const createMatchInternal = internalMutation({
  args: {
    userId: v.id("users"),
    result: v.union(v.literal("victory"), v.literal("defeat")),
    stageNumber: v.number(),
    stageDifficulty: v.optional(
      v.union(v.literal("normal"), v.literal("elite")),
    ),
    remainingHpPct: v.optional(v.number()),
    durationSeconds: v.optional(v.number()),
    coins: v.optional(v.number()),
    rewardCubes: v.optional(v.number()),
    playedAt: v.number(),
    notes: v.optional(v.string()),
    screenshotStorageIds: v.array(v.id("_storage")),
    modelUsed: v.optional(v.string()),
    confidence: v.optional(v.number()),
    turrets: v.array(turretValidator),
  },
  async handler(ctx, args) {
    const { turrets, userId, ...rest } = args;
    const stageId = await resolveStageId(
      ctx,
      userId,
      rest.stageNumber,
      rest.stageDifficulty,
    );
    const matchId = await ctx.db.insert("gdMatches", {
      ...rest,
      stageId,
      userId,
      updated: Date.now(),
    });
    for (const t of turrets) {
      await ctx.db.insert("gdMatchTurrets", {
        matchId,
        ...t,
        userId,
      });
    }
    return matchId;
  },
});

export const appendTurretsInternal = internalMutation({
  args: {
    matchId: v.id("gdMatches"),
    userId: v.id("users"),
    screenshotStorageId: v.id("_storage"),
    turrets: v.array(turretValidator),
  },
  async handler(ctx, { matchId, userId, screenshotStorageId, turrets }) {
    const match = await ctx.db.get(matchId);
    if (!match) throw new Error("Match not found");
    await ctx.db.patch(matchId, {
      screenshotStorageIds: [
        ...match.screenshotStorageIds,
        screenshotStorageId,
      ],
      updated: Date.now(),
    });
    const existing = await ctx.db
      .query("gdMatchTurrets")
      .withIndex("by_match", (q) => q.eq("matchId", matchId))
      .collect();
    const seen = new Set(existing.map((t) => t.turretKey));
    let nextSlot = existing.length;
    const inserted: string[] = [];
    for (const t of turrets) {
      if (seen.has(t.turretKey)) continue;
      await ctx.db.insert("gdMatchTurrets", {
        matchId,
        ...t,
        slot: nextSlot++,
        userId,
      });
      seen.add(t.turretKey);
      inserted.push(t.turretKey);
    }
    return inserted;
  },
});

/* ---------- aggregate helpers for the dashboard ---------- */

export const summary = query({
  async handler(ctx) {
    const user = await getCurrentUserOrThrow(ctx);
    const matches = await ctx.db
      .query("gdMatches")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();
    if (matches.length === 0) {
      return {
        matches: 0,
        wins: 0,
        winRate: 0,
        bestStage: 0,
        avgHp: 0,
        totalDamage: 0,
      };
    }
    const wins = matches.filter((m) => m.result === "victory").length;
    const bestStage = matches.reduce(
      (a, m) => Math.max(a, m.stageNumber),
      0,
    );
    const hps = matches
      .map((m) => m.remainingHpPct)
      .filter((v): v is number => typeof v === "number");
    const avgHp = hps.length
      ? Math.round(hps.reduce((a, b) => a + b, 0) / hps.length)
      : 0;
    const turretRows = await ctx.db
      .query("gdMatchTurrets")
      .withIndex("by_user_turretKey", (q) => q.eq("userId", user._id))
      .collect();
    const totalDamage = turretRows.reduce((a, t) => a + t.damage, 0);
    return {
      matches: matches.length,
      wins,
      winRate: Math.round((wins / matches.length) * 100),
      bestStage,
      avgHp,
      totalDamage,
    };
  },
});

export const turretLeaderboard = query({
  args: { limit: v.optional(v.number()) },
  async handler(ctx, { limit }) {
    const user = await getCurrentUserOrThrow(ctx);
    const rows = await ctx.db
      .query("gdMatchTurrets")
      .withIndex("by_user_turretKey", (q) => q.eq("userId", user._id))
      .collect();
    const turretCatalog = await ctx.db
      .query("gdTurrets")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();
    const catalogByKey = new Map(turretCatalog.map((t) => [t.key, t]));
    const agg = new Map<
      string,
      {
        key: string;
        displayName: string;
        damage: number;
        dps: number;
        uses: number;
      }
    >();
    for (const r of rows) {
      const entry = agg.get(r.turretKey) ?? {
        key: r.turretKey,
        displayName:
          r.turretDisplayName ??
          catalogByKey.get(r.turretKey)?.displayName ??
          r.turretKey,
        damage: 0,
        dps: 0,
        uses: 0,
      };
      entry.damage += r.damage;
      entry.dps += r.dps;
      entry.uses += 1;
      agg.set(r.turretKey, entry);
    }
    const ranked = [...agg.values()].sort((a, b) => b.damage - a.damage);
    return limit ? ranked.slice(0, limit) : ranked;
  },
});
