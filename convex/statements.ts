import { v } from "convex/values";
import { mutation, MutationCtx, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

export const create = mutation({
  args: {
    text: v.string(),
    type: v.string(),
    intentionId: v.optional(v.id("intentions")),
  },
  async handler(ctx, { text, type, intentionId }) {
    return ctx.db.insert("statements", {
      text,
      type: type as "what" | "why" | "mind_dump",
      intentionId,
    });
  },
});

export const createMindDumpStatement = mutation({
  args: {
    text: v.string(),
  },
  async handler(ctx, { text }) {
    return await create(ctx, { text, type: "mind_dump" });
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
    return (
      (await ctx.db
        .query("statements")
        .withIndex("by_intentionId", (q) => q.eq("intentionId", intentionId))
        .collect()) || []
    );
  },
});

export const update = mutation({
  args: {
    id: v.id("statements"),
    text: v.string(),
  },
  async handler(ctx, { id, text }) {
    await ctx.db.patch(id, { text });
  },
});
