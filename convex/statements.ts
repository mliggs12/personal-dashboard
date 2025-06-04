import { v } from "convex/values";

import { Id } from "./_generated/dataModel";
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
      text,
      type: type as "what" | "why" | "mind_dump",
      intentionId,
      updated: Date.now(),
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

export const clearMindDump = mutation({
  args: {},
  async handler(ctx) {
    const user = await getCurrentUserOrThrow(ctx);

    const statements = await ctx.db
      .query("statements")
      .withIndex("by_type_user", (q) =>
        q.eq("type", "mind_dump").eq("userId", user._id as Id<"users">),
      )
      .collect();

    if (statements.length === 0) {
      return;
    }

    for (const statement of statements) {
      await ctx.db.delete(statement._id);
    }
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
  },
  async handler(ctx, { id, text }) {
    await ctx.db.patch(id, {
      text,
    });
  },
});

export const complete = mutation({
  args: { id: v.id("statements") },
  async handler(ctx, { id }) {
    await ctx.db.patch(id, {});
  },
});

export const unComplete = mutation({
  args: { id: v.id("statements") },
  async handler(ctx, { id }) {
    await ctx.db.patch(id, {});
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
