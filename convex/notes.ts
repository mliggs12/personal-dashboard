import { v } from "convex/values";

import { mutation, query } from "./_generated/server";
import { getCurrentUser, getCurrentUserOrThrow } from "./users";

export const recent = query({
  async handler(ctx) {
    const user = await getCurrentUserOrThrow(ctx);

    const last5 = await ctx.db
      .query("notes")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .take(5);

    return last5;
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    text: v.optional(v.string()),
  },
  async handler(ctx, { title, text }) {
    const user = await getCurrentUserOrThrow(ctx);

    return await ctx.db.insert("notes", {
      title,
      text: text || "",
      updated: Date.now(),
      userId: user._id,
    });
  },
});

export const list = query({
  async handler(ctx) {
    const user = await getCurrentUserOrThrow(ctx);

    return await ctx.db
      .query("notes")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .collect();
  },
});

export const get = query({
  args: { noteId: v.id("notes") },
  async handler(ctx, { noteId }) {
    return await ctx.db.get(noteId);
  },
});

export const update = mutation({
  args: {
    noteId: v.id("notes"),
    title: v.optional(v.string()),
    text: v.optional(v.string()),
  },
  async handler(ctx, { noteId, title, text }) {
    const note = await ctx.db.get(noteId);
    if (note === null) throw new Error("Could not find note");

    await ctx.db.patch(noteId, {
      title: title || note.title,
      text: text || note.text,
      updated: Date.now(),
    });
  },
});

export const search = query({
  args: { query: v.string() },
  async handler(ctx, { query }) {
    const user = await getCurrentUser(ctx);

    if (!user) {
      return [];
    }

    return await ctx.db
      .query("notes")
      .withSearchIndex("search_title", (q) =>
        q.search("title", query).eq("userId", user._id),
      )
      .collect();
  },
});
