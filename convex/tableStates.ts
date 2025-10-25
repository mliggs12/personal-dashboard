import { v } from "convex/values";

import { mutation, query } from "./_generated/server";
import { getCurrentUserOrThrow } from "./users";

export const get = query({
  args: {
    tableId: v.string(),
  },
  async handler(ctx, { tableId }) {
    const user = await getCurrentUserOrThrow(ctx);

    const tableState = await ctx.db
      .query("tableStates")
      .withIndex("by_user_table", (q) => 
        q.eq("userId", user._id).eq("tableId", tableId)
      )
      .first();

    return tableState?.state ?? null;
  },
});

export const upsert = mutation({
  args: {
    tableId: v.string(),
    state: v.object({
      columnFilters: v.optional(v.any()),
      columnVisibility: v.optional(v.any()),
      sorting: v.optional(v.any()),
      pagination: v.optional(v.object({
        pageSize: v.number(),
      })),
    }),
  },
  async handler(ctx, { tableId, state }) {
    const user = await getCurrentUserOrThrow(ctx);
    const now = Date.now();

    const existing = await ctx.db
      .query("tableStates")
      .withIndex("by_user_table", (q) => 
        q.eq("userId", user._id).eq("tableId", tableId)
      )
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        state,
        updated: now,
      });
    } else {
      await ctx.db.insert("tableStates", {
        userId: user._id,
        tableId,
        state,
        updated: now,
      });
    }
  },
});

