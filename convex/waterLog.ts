import moment from "moment-timezone";
import { v } from "convex/values";
import { mutation } from "./_generated/server";

export const createEntry = mutation({
  args: {
    consumed: v.number(),
    date: v.optional(v.string()),
  },
  async handler(ctx, { consumed, date }) {
    await ctx.db.insert("waterLog", {
      consumed,
      date: date ? date : moment().format("YYYY/MM/DD"),
    });
  },
});
