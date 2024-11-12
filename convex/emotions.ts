import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const list = query(async (ctx) => {
  return await ctx.db.query("emotions").collect();
});

export const create = mutation({
  args: {
    label: v.string(),
    value: v.optional(v.string()),
    color: v.optional(v.string()),
  },
  async handler(ctx, { label, value, color }) {
    if (value === undefined) {
      value = label.toLowerCase();
    }

    const emotionId = await ctx.db.insert("emotions", {
      label,
      value,
      color,
    });

    return emotionId;
  },
});

export const update = mutation({
  args: {
    emotionId: v.id("emotions"),
    label: v.optional(v.string()),
    value: v.optional(v.string()),
    color: v.optional(v.string()),
  },
  async handler(ctx, { emotionId, label, value, color }) {
    if (label === undefined && value === undefined && color === undefined) {
      throw new Error("No fields to update.");
    }

    if (label && value === undefined) {
      value = label.toLowerCase();
    }

    await ctx.db.patch(emotionId, {
      label,
      value,
      color,
    });
  },
});

export const getLabelById = query({
  args: {
    emotionId: v.id("emotions"),
  },
  async handler(ctx, { emotionId }) {
    const emotion = await ctx.db.get(emotionId);

    if (!emotion) {
      throw new Error(`Emotion "${emotionId}" not found.`);
    }

    return emotion.label;
  },
});

export const getByValue = query({
  args: {
    value: v.string(),
  },
  async handler(ctx, { value }) {
    const emotion = await ctx.db
      .query("emotions")
      .filter((q) => q.eq(q.field("value"), value))
      .unique();

    return emotion;
  },
});
