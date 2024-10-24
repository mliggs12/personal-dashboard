import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import moment from "moment-timezone";

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
    title: v.string(),
    text: v.optional(v.string()),
  },
  async handler(ctx, { title, text }) {
    await ctx.db.insert("notes", { title, text });
  },
});

export const list = query({
  async handler(ctx) {
    const notes = await ctx.db.query("notes").order("desc").collect();
    if (!notes) {
      throw new ConvexError("Unable to retrieve notes");
    }

    return notes;
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

export const update = mutation({
  args: {
    id: v.id("notes"),
    title: v.optional(v.string()),
    text: v.optional(v.string()),
  },
  async handler(ctx, { id, title, text }) {
    try {
      const existingNote = await ctx.db.get(id);

      const updatedNote = {
        ...existingNote,
        title: title ?? existingNote?.title ?? "",
        text: text ?? existingNote?.text ?? "",
        updated: moment().valueOf(),
      };

      await ctx.db.patch(id, updatedNote);
    } catch (error) {
      console.error(error);
      throw error;
    }
  },
});
