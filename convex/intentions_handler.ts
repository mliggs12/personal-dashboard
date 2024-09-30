import { v } from "convex/values";
import { internalMutation, mutation } from "./_generated/server";
import { query } from "./_generated/server";

export const baseHandler = internalMutation({
  async handler(ctx) {
    try {
      const baseHandler = await ctx.db.query("intentions_handler").first();

      if (!baseHandler) {
        const newBaseHandlerId = await ctx.db.insert("intentions_handler", {});

        return await ctx.db.get(newBaseHandlerId);
      }

      return baseHandler;
    } catch (error) {
      console.error(error);
      throw error;
    }
  },
});

export const checkAllowingIntentions = mutation({
  args: {},
  async handler(ctx, args) {
    const bh = await baseHandler(ctx, args);
    const updatedAt = bh!.updatedAt;

    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to the start of the day

    if (bh && bh._id) {
      if (!updatedAt || updatedAt < today.getTime()) {
        const allowingIntentions = await ctx.db
          .query("intentions")
          .filter((q) => q.eq(q.field("status"), "allowing"))
          .collect();

        if (allowingIntentions.length === 0) {
          await ctx.db.patch(bh._id, { updatedAt: Date.now(), count: 0 });
          return [];
        }

        // Check each intention's `updatedAt` and if it has been more than 3 days from today,
        // set the intention's status to "to_tithe"
        let count = 0;
        for (const intention of allowingIntentions) {
          const updatedAt = new Date(intention.updatedAt!);
          const diffTime = Math.abs(updatedAt.getTime() - today.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          if (diffDays > 3) {
            await ctx.db.patch(intention._id, { status: "to_tithe" });
          }
          count++;
        }

        await ctx.db.patch(bh._id, { updatedAt: Date.now(), count });
      } else {
        await ctx.db.patch(bh._id, { updatedAt: Date.now() });
        return []; // Return an empty array if it has been updated today
      }
    }

    return [];
  },
});

export const getUpdatedAt = query({
  args: { id: v.id("intentions_handler"), bh: v.id("intentions_handler") },
  async handler(ctx, args) {
    const bh = await ctx.db.get(args.bh);
    return bh?.updatedAt;
  },
});
