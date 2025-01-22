import { ConvexError, v } from "convex/values";

import { mutation, query } from "./_generated/server";
import { mutationWithUser, queryWithUser } from "./utils";

export const create = mutationWithUser({
  args: {
    title: v.string(),
    content: v.optional(v.string()),
  },
  async handler(ctx, { title, content }) {
    const userId = ctx.userId;

    return await ctx.db.insert("notes", {
      title,
      content: content || "",
      updated: Date.now(),
      userId,
    });
  },
});

export const list = queryWithUser({
  async handler(ctx) {
    const userId = ctx.userId;
    if (userId === undefined) {
      return null;
    }

    return await ctx.db
      .query("notes")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
  },
});

export const get = queryWithUser({
  args: { noteId: v.id("notes") },
  async handler(ctx, { noteId }) {
    return await ctx.db.get(noteId);
  },
});

export const update = mutation({
  args: {
    noteId: v.id("notes"),
    title: v.optional(v.string()),
    content: v.optional(v.string()),
  },
  async handler(ctx, { noteId, title, content }) {
    const note = await ctx.db.get(noteId);
    if (note === null) throw new ConvexError("Could not find note");

    await ctx.db.patch(noteId, {
      title: title || note.title,
      content: content || note.content,
      updated: Date.now(),
    });
  },
});

export const search = queryWithUser({
  args: { query: v.string() },
  async handler(ctx, { query }) {
    const userId = ctx.userId;
    if (userId === undefined) {
      return null;
    }

    return await ctx.db
      .query("notes")
      .withSearchIndex("search_title", (q) =>
        q.search("title", query).eq("userId", userId),
      )
      .collect();
  },
});
