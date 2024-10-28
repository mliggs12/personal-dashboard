import { query } from "./_generated/server";

export const list = query(async (ctx) => {
  return await ctx.db.query("events").collect();
});
