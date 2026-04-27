import { v } from "convex/values";

import {
  internalMutation,
  mutation,
  query,
} from "./_generated/server";
import { getCurrentUserOrThrow } from "./users";

/**
 * Per-user turret catalog. The parser records turrets by a stable
 * `key`; we upsert here so a leaderboard join can show a pretty
 * display name and (eventually) an icon.
 */

export const list = query({
  async handler(ctx) {
    const user = await getCurrentUserOrThrow(ctx);
    const turrets = await ctx.db
      .query("gdTurrets")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();
    return turrets.sort((a, b) => b.usesCount - a.usesCount);
  },
});

export const upsert = mutation({
  args: {
    key: v.string(),
    displayName: v.optional(v.string()),
    increment: v.optional(v.number()),
  },
  async handler(ctx, { key, displayName, increment = 1 }) {
    const user = await getCurrentUserOrThrow(ctx);
    const existing = await ctx.db
      .query("gdTurrets")
      .withIndex("by_user_key", (q) =>
        q.eq("userId", user._id).eq("key", key),
      )
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        displayName: displayName ?? existing.displayName,
        usesCount: existing.usesCount + increment,
        updated: Date.now(),
      });
      return existing._id;
    }
    return await ctx.db.insert("gdTurrets", {
      key,
      displayName,
      usesCount: Math.max(increment, 0),
      userId: user._id,
      updated: Date.now(),
    });
  },
});

/**
 * Internal variant used by the parse action via `runMutation`, where
 * the user must be passed explicitly since actions don't carry the
 * Clerk identity through to internal mutations reliably.
 */
export const upsertInternal = internalMutation({
  args: {
    userId: v.id("users"),
    key: v.string(),
    displayName: v.optional(v.string()),
    increment: v.optional(v.number()),
  },
  async handler(ctx, { userId, key, displayName, increment = 1 }) {
    const existing = await ctx.db
      .query("gdTurrets")
      .withIndex("by_user_key", (q) =>
        q.eq("userId", userId).eq("key", key),
      )
      .first();
    if (existing) {
      await ctx.db.patch(existing._id, {
        displayName: displayName ?? existing.displayName,
        usesCount: existing.usesCount + increment,
        updated: Date.now(),
      });
      return existing._id;
    }
    return await ctx.db.insert("gdTurrets", {
      key,
      displayName,
      usesCount: Math.max(increment, 0),
      userId,
      updated: Date.now(),
    });
  },
});

export const rename = mutation({
  args: {
    turretId: v.id("gdTurrets"),
    displayName: v.string(),
  },
  async handler(ctx, { turretId, displayName }) {
    const user = await getCurrentUserOrThrow(ctx);
    const turret = await ctx.db.get(turretId);
    if (!turret || turret.userId !== user._id) {
      throw new Error("Turret not found");
    }
    await ctx.db.patch(turretId, { displayName, updated: Date.now() });
  },
});
