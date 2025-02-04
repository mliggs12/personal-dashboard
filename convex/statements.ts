import { v } from "convex/values";

import { mutation, query } from "./_generated/server";
import { getCurrentUserOrThrow } from "./users";

export const create = mutation({
  args: {
    text: v.string(),
    type: v.string(),
    intentionId: v.optional(v.id("intentions")),
  },
  async handler(ctx, { text, type, intentionId }) {
    const user = await getCurrentUserOrThrow(ctx);

    return ctx.db.insert("statements", {
      isComplete: false,
      text,
      type: type as "what" | "why" | "mind_dump",
      intentionId,
      userId: user._id,
    });
  },
});

export const get = query({
  args: { statementId: v.id("statements") },
  async handler(ctx, { statementId }) {
    return await ctx.db.get(statementId);
  },
});

export const remove = mutation({
  args: { id: v.id("statements") },
  async handler(ctx, { id }) {
    await ctx.db.delete(id);
  },
});

export const byIntentionId = query({
  args: { intentionId: v.id("intentions") },
  async handler(ctx, { intentionId }) {
    return await ctx.db
      .query("statements")
      .withIndex("by_intentionId", (q) => q.eq("intentionId", intentionId))
      .collect();
  },
});

export const update = mutation({
  args: {
    id: v.id("statements"),
    date: v.optional(v.string()),
    text: v.optional(v.string()),
    isComplete: v.optional(v.boolean()),
  },
  async handler(ctx, { id, text, isComplete, date }) {
    await ctx.db.patch(id, {
      date,
      isComplete,
      text,
    });
  },
});

export const complete = mutation({
  args: { id: v.id("statements") },
  async handler(ctx, { id }) {
    await ctx.db.patch(id, { isComplete: true });
  },
});

export const unComplete = mutation({
  args: { id: v.id("statements") },
  async handler(ctx, { id }) {
    await ctx.db.patch(id, { isComplete: false });
  },
});

export const todayMindDumpStatements = query({
  args: {},
  async handler(ctx) {
    const user = await getCurrentUserOrThrow(ctx);

    const today = new Date();
    const startOfToday = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
    );
    const endOfToday = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() + 1,
    );

    return await ctx.db
      .query("statements")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .filter((q) => q.eq(q.field("type"), "mind_dump"))
      .collect();
  },
});
