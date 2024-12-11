import { Id } from "./_generated/dataModel";
import { QueryCtx } from "./_generated/server";

export async function getUserWaterEntries(
  ctx: QueryCtx,
  userId: string,
  startTime: number,
  endTime: number,
) {
  return await ctx.db
    .query("waterLogEntries")
    .withIndex("by_user_timestamp", (q) =>
      q
        .eq("userId", userId as Id<"users">)
        .gte("timestamp", startTime)
        .lt("timestamp", endTime),
    )
    .collect();
}
