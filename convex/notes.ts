import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const recent = query({
  async handler(ctx) {
    const last5 = await ctx.db.query("notes").order("desc").take(5);
    if (!last5) {
      throw new ConvexError("Unable to retrieve notes");
    }

    return last5;
  },
});

export const create = mutation({
  args: {
    title: v.optional(v.string()),
    text: v.optional(v.string()),
  },
  async handler(ctx, { title, text }) {
    await ctx.db.insert("notes", { title, text });
  },
});

export const get = query({
  args: {
    id: v.id("notes"),
  },
  async handler(ctx, { id }) {
    const note = await ctx.db.get(id);
    if (!note) {
      throw new ConvexError("Unable to retrieve note");
    }

    return note;
  },
});
