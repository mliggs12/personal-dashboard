import { v } from "convex/values";

import { mutation, query } from "./_generated/server";
import { getCurrentUserOrThrow } from "./userHelpers";

export const list = query(async (ctx) => {
  const user = await getCurrentUserOrThrow(ctx);

  return await ctx.db
    .query("activities")
    .filter((q) => q.eq(q.field("userId"), user._id))
    .collect();
});

export const listBySchedule = query({
  args: {
    scheduleId: v.id("schedules"),
  },
  async handler(ctx, { scheduleId }) {
    const activities = await ctx.db
      .query("activities")
      .filter((q) => q.eq(q.field("scheduleId"), scheduleId))
      .collect();

    return activities;
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    length: v.number(),
    scheduleId: v.id("schedules"),
  },
  async handler(ctx, { scheduleId, name, length }) {
    const user = await getCurrentUserOrThrow(ctx);

    return await ctx.db.insert("activities", {
      name,
      length,
      isForced: false,
      isRigid: false,
      scheduleId,
      userId: user._id,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("activities"),
    name: v.optional(v.string()),
    length: v.optional(v.number()),
    isForced: v.optional(v.boolean()),
    isRigid: v.optional(v.boolean()),
  },
  async handler(ctx, { id, length, name, isForced, isRigid }) {
    const existingActivity = await ctx.db.get(id);
    if (!existingActivity) {
      throw new Error("Activity not found");
    }

    return await ctx.db.patch(id, {
      name: name || existingActivity.name,
      length: length || existingActivity.length,
      isForced: isForced || existingActivity.isForced,
      isRigid: isRigid || existingActivity.isRigid,
    });
  },
});
